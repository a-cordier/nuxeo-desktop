require.config({
  //By default load any module IDs from js/lib
  baseUrl: 'js/lib',
  paths: {
    'desktop': '../app/desktop',
    'calendar': '../app/calendar',
    'explorer': '../app/explorer',
    'common': '../app/common',
    'auth': '../app/auth',
    'moment': ['moment.min', 'moment'],
    'datetimepicker': 'bootstrap-datetimepicker.min',
    'fullcalendar': 'fullcalendar.min',
    'jquery': ['jquery.min', 'jquery'],
    'jquery.modal': 'jquery.modal.min',
    'jquery-ui': 'jquery-ui.min',
    'jquery.dialogExtend': 'jquery.dialogextend.min'
  },
  shim: {
    "jquery-ui": {
      exports: "$",
      deps: ['jquery']
    },
    "jquery.modal": {
      exports: "$",
      deps: ['jquery']
    },
    "jquery.cookie": {
      exports: "$",
      deps: ['jquery']
    },
    "fullcalendar": {
      exports: "$",
      deps: ['jquery', 'moment']
    },
    "bootstrap": ['jquery']
  }
});

// Start the main app logic.
require(['desktop/controller'], function(controller) {
  controller.init();
});