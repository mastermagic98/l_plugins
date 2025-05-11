// // Test1222

                        Lampa.Storage.set('trailers_start', false);
                        Lampa.Activity.push({
                            url: '',
                            title: Lampa.Lang.translate('trailers_main'),
                            component: 'trailers_main',
                            page: 1
                        });
                    }
                }, 1000);
            }
        });
    }

    if (!window.plugin_trailers_ready) startPlugin();
})();
