(function(){

  function bindHandlers(){
    $('.rail-section').on('click', function(){
      var $el = $(this);
      $('.rail-section .rail-section-title').removeClass('active');
      $el.find('.rail-section-title').addClass('active');
      var data_section = $el.attr('data-section');
      $('.content-section').removeClass('shown')
      $('.content-section[data-section="'+data_section+'"]').addClass('shown')
    });
  }

  bindHandlers();
}).call(this);
