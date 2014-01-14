(function() {

  var transform = xtag.prefix.js + 'Transform';
  function getState(el) {
    var selected = xtag.query(el, 'x-slides > x-slide[selected]')[0] || 0;
    return [selected ? xtag.query(el, 'x-slides > x-slide').indexOf(selected) : selected, el.firstElementChild.children.length - 1];
  }

  function slide(el, index) {
    var slides = xtag.toArray(el.firstElementChild.children);
    slides.forEach(function(slide) {
      slide.removeAttribute('selected');
    });

    slides[index || 0].setAttribute('selected', true);
    var translate = 'translate' + (el.getAttribute('orientation') || 'x') + '(' + (index || 0) * (-100 / slides.length) + '%)';
    el.firstElementChild.style[transform] = translate;
    el.firstElementChild.style.transform = translate;

    var thumbnails = document.querySelectorAll('x-thumbnails img');
    thumbnails[0].setAttribute('selected', true);
  }

  function init(toSelected) {
    var slides = this.firstElementChild;
    if (!slides ||
        !slides.children.length ||
        slides.tagName.toLowerCase() !== 'x-slides') {
      return;
    }

    var children = xtag.toArray(slides.children);
    var size = 100 / (children.length || 1);
    var orient = this.getAttribute('orientation') || 'x';
    var style = orient === 'x' ? ['width', 'height'] : ['height', 'width'];

    slides.style[style[1]] = '100%';
    slides.style[style[0]] = children.length * 100 + '%';
    slides.style[transform] = 'translate' + orient + '(0%)';
    slides.style.transform = 'translate' + orient + '(0%)';
    children.forEach(function(slide) {
      slide.style[style[0]] = size + '%';
      slide.style[style[1]] = '100%';
    });

    // TODO: Make sure this gets called after all thumbnails
    // have been created.
    var thumbnails = document.querySelectorAll('x-thumbnails img');
    var thumb = thumbnails[toSelected || 0];
    if (thumb) {
      thumb.setAttribute('selected', true);
    }

    if (toSelected) {
      var selected = slides.querySelector('[selected]');
      if (selected) {
        slide(this, children.indexOf(selected) || 0);
      }
    }
  }

  xtag.register('x-gallery', {
    lifecycle: {
      created: function() {
        init();
      }
    },
    events: {
      'transitionend': function(e) {
        if (e.target === this.firstElementChild) {
          xtag.fireEvent(this, 'slideend');
        }
      },
      'show:delegate(x-slide)': function(e) {
        var slide = e.target;
        if (slide.parentNode.nodeName.toLowerCase() === 'x-slides' &&
            slide.parentNode.parentNode.nodeName.toLowerCase() === 'x-gallery') {
          var slideWrap = slide.parentNode;
          var box = slideWrap.parentNode;
          var slides = xtag.query(slideWrap, 'x-slide');

          box.slideTo(slides.indexOf(slide));
        }
      }
    },
    accessors: {
      orientation: {
        get: function() {
          return this.getAttribute('orientation');
        },
        set: function(value) {
          var gallery = this;
          // prevent filmstrip animation when setting orientation
          xtag.skipTransition(gallery.firstElementChild, function() {
              gallery.setAttribute('orientation', value.toLowerCase());
              init.call(gallery, true);
          });
        }
      }
    },
    methods: {
      slideTo: function(index) {
        slide(this, index);
      },
      slideNext: function() {
        var shift = getState(this);
        shift[0]++;
        slide(this, shift[0] > shift[1] ? 0 : shift[0]);
      },
      slidePrevious: function() {
        var shift = getState(this);
        shift[0]--;
        slide(this, shift[0] < 0 ? shift[1] : shift[0]);
      }
    }
  });

  xtag.register('x-slide', {
    lifecycle: {
      inserted: function() {
        var ancestor = this.parentNode.parentNode;
        if (ancestor.tagName.toLowerCase() === 'x-gallery') {
          init.call(ancestor, true);
        }
        this.createThumbnail();
      },
      created: function() {
        if (this.parentNode) {
          var ancestor = this.parentNode.parentNode;
          if (ancestor.tagName.toLowerCase() === 'x-gallery') {
            init.call(ancestor, true);
          }
        }
      }
    },
    methods: {
      createThumbnail: function() {
        var imgSrc = this.querySelector('img').src;
        console.log('thumbnail created:', imgSrc);

        // var ancestor = this.parentNode.parentNode;
        // TODO: Move `x-thumbnails` into `x-gallery`.
        var ancestor = document.querySelector('x-gallery');
        if (ancestor.tagName.toLowerCase() === 'x-gallery') {
          // var thumbnails = ancestor.querySelector('x-thumbnails');
          var thumbnails = document.querySelector('x-thumbnails');
          if (!thumbnails.querySelector('image[src="' + imgSrc + '"]')) {
            var i = document.createElement('img');
            i.src = imgSrc;
            thumbnails.appendChild(i);
          }
        }
      }
    }
  });

})();
