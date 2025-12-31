(function () {
  'use strict';

  // === МОДЕЛИ ===
  var MODELS = [
    {
      name: 'Qwen 2.5-72B',
      model: 'qwen/qwen-2.5-72b-instruct:free',
      provider: 'openrouter',
      apiKey: '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', //доьавь ключ сюда
      baseUrl: 'https://openrouter.ai/api/v1',
      // Получение ключа: https://openrouter.ai/keys → Создай аккаунт → API Keys → Скопируй ключ
    },
    /* примеры других моделей и их конфигов
    {
      name: 'DeepSeek R1 (HF)',
      model: 'deepseek-ai/DeepSeek-R1',
      provider: 'huggingface',
      apiKey: 'hf_******', // Замени на свой
      baseUrl: 'https://router.huggingface.co/hf-inference/models',
      // Получение ключа: https://huggingface.co/settings/tokens → New token → Read access
    },
    {
      name: 'DeepSeek R1 (Direct)',
      model: 'deepseek-chat',
      provider: 'openai',
      apiKey: 'sk-d39a3858d1b541fc9164b262689d4e84',
      baseUrl: 'https://api.deepseek.com/v1',
      // Получение ключа: https://platform.deepseek.com/api_keys → API Keys → Create new
    }
    */
  ];

  var currentModelIndex = 0;
  var maxRetriesPerModel = 2; // ← Теперь 2 попытки на модель

  // === УТИЛИТЫ ===
  var logger = {
    log: function () { console.log.apply(console, ["[ИИ поиск]"].concat(Array.prototype.slice.call(arguments))); },
    warn: function () { console.warn.apply(console, ["[ИИ поиск]"].concat(Array.prototype.slice.call(arguments))); },
    error: function () { console.error.apply(console, ["[ИИ поиск]"].concat(Array.prototype.slice.call(arguments))); }
  };

  function getCurrentModel() {
    return MODELS[currentModelIndex] || MODELS[0];
  }

  function switchToNextModel() {
    currentModelIndex = (currentModelIndex + 1) % MODELS.length;
    var model = getCurrentModel();
    logger.log("Переключение на модель:", model.name);
  }

  function hashString(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  function getFromCache(cacheName, key) {
    try {
      var cache = Lampa.Storage.get(cacheName) || {};
      var entry = cache[key];
      if (entry && Date.now() - entry.timestamp < 86400000) {
        return entry.data;
      }
    } catch (e) { logger.error("Cache read error:", e); }
    return null;
  }

  function setToCache(cacheName, key, data) {
    try {
      var cache = Lampa.Storage.get(cacheName) || {};
      cache[key] = { data: data, timestamp: Date.now() };
      Lampa.Storage.set(cacheName, cache);
    } catch (e) { logger.error("Cache write error:", e); }
  }

  function parseJsonFromResponse(response) {
    if (!response || typeof response !== 'string') return null;
    response = response.trim();

    var codeBlockStart = response.indexOf("```");
    if (codeBlockStart !== -1) {
      var contentStart = codeBlockStart + 3;
      if (response.substring(contentStart, contentStart + 4).toLowerCase() === "json") contentStart += 4;
      while (contentStart < response.length && /[\s\n\r]/.test(response[contentStart])) contentStart++;
      var codeBlockEnd = response.indexOf("```", contentStart);
      if (codeBlockEnd !== -1) {
        try { return JSON.parse(response.substring(contentStart, codeBlockEnd).trim()); } catch (e) {}
      }
    }

    var braceCount = 0, jsonStart = -1, jsonEnd = -1;
    for (var i = 0; i < response.length; i++) {
      if (response[i] === '{') { if (jsonStart === -1) jsonStart = i; braceCount++; }
      else if (response[i] === '}') { braceCount--; if (braceCount === 0 && jsonStart !== -1) { jsonEnd = i; break; } }
    }
    if (jsonStart !== -1 && jsonEnd !== -1) {
      try { return JSON.parse(response.substring(jsonStart, jsonEnd + 1)); } catch (e) {}
    }

    return null;
  }

  function extractRecommendations(parsedData) {
    var recommendations = [];
    if (!parsedData) return recommendations;
    var items = parsedData.recommendations || parsedData.movies || parsedData.items || parsedData.results || [];
    if (!Array.isArray(items)) items = [];

    var max = 15;
    for (var i = 0; i < items.length && recommendations.length < max; i++) {
      var item = items[i];
      if (!item || typeof item !== "object") continue;
      var rec = {
        title: item.title || item.name || item.film || '',
        year: parseInt(item.year || item.release_year || item.date || '0') || null,
        reason: item.reason || item.explanation || item.description || item.why || ''
      };
      if (rec.title && rec.title.trim()) recommendations.push(rec);
    }
    return recommendations;
  }

  // === AI ЗАПРОС С УМНЫМИ УВЕДОМЛЕНИЯМИ ===
  function queryAI(query, callback, attempt = 0, modelAttempt = 0) {
    var totalAttempts = MODELS.length * maxRetriesPerModel;
    if (attempt >= totalAttempts) {
      Lampa.Noty.show('Ошибка: Все модели недоступны. Проверьте интернет или API-ключи.');
      return callback(new Error("Все модели недоступны"));
    }

    var modelIndex = Math.floor(attempt / maxRetriesPerModel);
    var retryInModel = attempt % maxRetriesPerModel;

    if (modelIndex >= MODELS.length) {
      return callback(new Error("Лимит попыток исчерпан"));
    }

    currentModelIndex = modelIndex;
    var modelConfig = getCurrentModel();
    var cacheKey = 'query_' + hashString(query + '_' + modelConfig.name);
    var cached = getFromCache('ai_search_cache', cacheKey);
    if (cached) {
      logger.log("Кэш найден для:", modelConfig.name);
      return callback(null, cached);
    }

    var maxResults = 10;
    var prompt = "Запрос: \"" + query + "\"\nПредложи ровно " + maxResults + " фильмов/сериалов.\n" +
      "Формат: {\"recommendations\":[{\"title\":\"Название\",\"year\":2023}]}\n" +
      "ТОЛЬКО JSON, без текста.";

    var requestBody = {
      model: modelConfig.model,
      messages: [
        { role: "system", content: "Ты киноэксперт. Отвечай ТОЛЬКО валидным JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 1500
    };

    if (modelConfig.provider === 'openrouter' || modelConfig.provider === 'openai') {
      try { requestBody.response_format = { type: "json_object" }; } catch (e) {}
    }

    var timeout = setTimeout(function () {
      logger.warn("Таймаут для", modelConfig.name);
      Lampa.Noty.show(`Таймаут: ${modelConfig.name} не отвечает`);
      clearTimeout(timeout);
      queryAI(query, callback, attempt + 1);
    }, 25000);

    var endpoint = modelConfig.baseUrl + '/chat/completions';
    if (modelConfig.provider === 'huggingface') {
      endpoint = modelConfig.baseUrl + '/' + modelConfig.model;
      requestBody = {
        inputs: prompt,
        parameters: { max_new_tokens: 1500, temperature: 0.6, return_full_text: false }
      };
    }

    logger.log(`Попытка ${retryInModel + 1}/${maxRetriesPerModel} → ${modelConfig.name}`);

    fetch(endpoint, {
      method: "POST",
      headers: {
        'Authorization': 'Bearer ' + modelConfig.apiKey,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Lampa AI Search'
      },
      body: JSON.stringify(requestBody)
    })
    .then(function (res) {
      clearTimeout(timeout);
      return res.text().then(function (text) {
        if (!res.ok) {
          var errorMsg = text.substring(0, 200);
          logger.error("HTTP " + res.status + " от " + modelConfig.name + ":", errorMsg);

          if (res.status === 401) {
            Lampa.Noty.show(`Ошибка авторизации: ${modelConfig.name}\nНеверный API-ключ`);
          } else if (res.status === 429) {
            Lampa.Noty.show(`Лимит запросов: ${modelConfig.name}\nПопробуйте позже`);
          } else if (res.status === 404) {
            Lampa.Noty.show(`Модель не найдена: ${modelConfig.name}`);
          } else if (res.status >= 500) {
            Lampa.Noty.show(`Серверная ошибка: ${modelConfig.name}`);
          }

          throw new Error("HTTP " + res.status);
        }
        return text;
      });
    })
    .then(function (text) {
      logger.log("Ответ от", modelConfig.name + ":", text.substring(0, 1000));

      var data;
      try { data = JSON.parse(text); } catch (e) {}

      var content = '';
      if (modelConfig.provider === 'huggingface') {
        content = (data && data[0] && data[0].generated_text) || '';
      } else {
        content = (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
      }

      if (!content) throw new Error("Пустой ответ");

      var parsed = parseJsonFromResponse(content);
      if (!parsed) throw new Error("Не JSON");

      var recs = extractRecommendations(parsed);
      if (!recs.length) throw new Error("Нет рекомендаций");

      var result = { recommendations: recs };
      setToCache('ai_search_cache', cacheKey, result);
      callback(null, result);
    })
    .catch(function (err) {
      logger.warn("Ошибка от", modelConfig.name + ":", err.message);

      if (retryInModel + 1 >= maxRetriesPerModel) {
        Lampa.Noty.show(`Модель ${modelConfig.name} недоступна`);
      }

      setTimeout(function () {
        queryAI(query, callback, attempt + 1);
      }, 1200);
    });
  }

  // === TMDB ПОИСК ===
  function fetchTmdbData(recommendations, callback) {
    var results = [], processed = 0, limit = Math.min(recommendations.length, 15);
    if (limit === 0) return callback([]);

    var request = new Lampa.Reguest();

    function next() {
      processed++;
      if (processed >= limit) callback(results);
    }

    function processItem(item) {
      if (!item || !item.title) return next();
      var key = "tmdb_" + hashString(item.title + (item.year || ''));
      var cached = getFromCache("ai_search_tmdb_cache", key);
      if (cached) { results.push(cached); return next(); }

      var url = Lampa.TMDB.api("search/multi?query=" + encodeURIComponent(item.title) + "&api_key=" + Lampa.TMDB.key() + "&language=ru");
      request.silent(url, function (data) {
        if (data && data.results && data.results.length > 0) {
          var best = data.results[0];
          if (item.year) {
            for (var i = 0; i < data.results.length; i++) {
              var r = data.results[i];
              var year = (r.release_date || r.first_air_date || '').substring(0, 4);
              if (year && parseInt(year) === parseInt(item.year)) { best = r; break; }
            }
          }
          if (best.media_type === 'movie' || best.media_type === 'tv') {
            var movie = {
              id: best.id,
              title: best.title || best.name,
              original_title: best.original_title || best.original_name,
              overview: best.overview || '',
              poster_path: best.poster_path,
              backdrop_path: best.backdrop_path,
              vote_average: best.vote_average || 0,
              release_date: best.release_date || best.first_air_date,
              type: best.media_type === 'tv' ? 'tv' : 'movie'
            };
            results.push(movie);
            setToCache("ai_search_tmdb_cache", key, movie);
          }
        }
        next();
      }, next);
    }

    for (var i = 0; i < limit; i++) processItem(recommendations[i]);
  }

  // === ИСТОЧНИК ПОИСКА ===
  var AiSearchSource = {
    discovery: function () {
      return {
        title: 'AI Поиск',
        search: function (params, oncomplite) {
          var query = decodeURIComponent(params.query || '').trim();
          if (!query) return oncomplite([]);

          Lampa.Noty.show('AI ищет: ' + query);
          currentModelIndex = 0;

          queryAI(query, function (err, aiResult) {
            if (err) {
              logger.error("AI Error:", err.message);
              Lampa.Noty.show('Ошибка AI: ' + err.message);
              return oncomplite([]);
            }

            fetchTmdbData(aiResult.recommendations, function (tmdbResults) {
              if (!tmdbResults.length) {
                Lampa.Noty.show('Ничего не найдено в TMDB');
                return oncomplite([]);
              }

              var results = tmdbResults.map(function (item) {
                return {
                  id: item.id,
                  title: item.title,
                  name: item.title,
                  poster_path: item.poster_path ? Lampa.TMDB.image('t/p/w200' + item.poster_path) : '',
                  release_year: (item.release_date || '').substring(0, 4),
                  vote_average: item.vote_average,
                  type: item.type,
                  source: 'tmdb',
                  method: item.type
                };
              });

              oncomplite([{
                title: 'AI Рекомендации (' + results.length + ')',
                results: results,
                total: results.length
              }]);
            });
          });
        },
        params: {
          save: true,
          lazy: true,
          start_typing: 'ai_search_start_typing',
          nofound: 'search_nofound'
        },
        onSelect: function (params, close) {
          close();
          if (params.element) {
            Lampa.Activity.push({
              url: '',
              title: params.element.type === 'tv' ? 'Сериал' : 'Фильм',
              component: 'full',
              id: params.element.id,
              method: params.element.type,
              source: 'tmdb'
            });
          }
        }
      };
    }
  };

  // === ИНИЦИАЛИЗАЦИЯ ===
  function initialize() {
    if (!Lampa || !Lampa.Search) {
      setTimeout(initialize, 500);
      return;
    }

    Lampa.Search.addSource(AiSearchSource.discovery());
    logger.log("AI Search Source инициализирован (2 попытки на модель, уведомления включены)");
  }

  if (window.appready) {
    setTimeout(initialize, 500);
  } else {
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready') setTimeout(initialize, 500);
    });
  }

})();
