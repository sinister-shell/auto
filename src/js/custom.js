/*customs scripts*/

window.addEventListener('DOMContentLoaded', () => {

    /*=== Tabs ===*/
    let tabs = function() {
        const tabscontent = document.querySelectorAll('.tabs__content');
        const tabheaders = document.querySelectorAll('.tabs__wrapper');
        const tabsMenu = document.querySelectorAll('.tabs__item');

        const hideContentTab = () => {
            tabscontent.forEach(item => {
                item.classList.add('hide');
                item.classList.remove('show', 'fade');
            });

            tabsMenu.forEach(item => {
                item.classList.remove('tabs__item--active');
            });
        };

        const showContentTab = (i = 0) => {
            tabscontent[i].classList.add('show', 'fade');
            tabscontent[i].classList.remove('hide');
            tabsMenu[i].classList.add('tabs__item--active');
        };

        hideContentTab();
        showContentTab();

        for(let i = 0; i < tabheaders.length; i++) {
            tabheaders[i].addEventListener('click', (evt) => {
                if (evt.target && evt.target.matches('.tabs__item')) {
                    tabsMenu.forEach((item, i) => {
                        if (evt.target == item) {
                            hideContentTab();
                            showContentTab(i);
                        }
                    });
                }
            });
        }
    };
    tabs();

    /*=== Slider testimonials ===*/
    let slider = function() {
        tns({
            container: '.slider',
            preventScrollOnTouch: 'force',
            items: 1,
            responsive: {
                580: {
                    //edgePadding: 20,
                    gutter: 30,
                    items: 2
                },
                960: {
                    // gutter: 30,
                    items: 3,
                }
            },
            slideBy: 'page',
            autoplay: false,
            nav: false,
            controlsPosition: 'bottom',
            controlsText: ['<svg class="slider__arrow slider__arrow--prev"><use xlink:href="#arrow-slider"></use></svg>', '<svg class="slider__arrow slider__arrow--next"><use xlink:href="#arrow-slider"></use></svg>']
        });

    };
    slider();

});

/*=== Mobile button sandwich ===*/
let sandwich = function () {
    $(document).on('click', '.sandwich', function () {
        $(this).toggleClass('sandwich--open');
        $('.main-header__sm').toggleClass('main-header__sm--open');
        $('.slogan--sm').toggleClass('slogan--open');
        $('.connection--sm').toggleClass('connection--open');
        $('.social--sm').toggleClass('social--open');
        $('.main-nav--sm').toggleClass('main-nav--open');
        $('body').toggleClass('scroll-hidden');
    });
};
sandwich();

/*=== Click on menu in mobile version ===*/
$(document).ready(function() {
    function checkWidth() {
        let windowWidth = $('body').innerWidth(),
            elem = $(".site-navigation__item a");
        if(windowWidth < 576){
            elem.addClass('js-menu-link');
            $('.js-menu-link').click(function (e) {
                e.preventDefault();
                $('body').removeClass('scroll-hidden');
                $('.sandwich').removeClass('sandwich--open');
                $('.main-header__sm').removeClass('main-header__sm--open');
                $('.slogan--sm').removeClass('slogan--open');
                $('.connection--sm').removeClass('connection--open');
                $('.social--sm').removeClass('social--open');
                $('.main-nav--sm').removeClass('main-nav--open');
            });
        }
        else{
            elem.removeClass('js-menu-link');
        }
    }

    checkWidth();

    $(window).resize(function(){
        checkWidth();
    });
});


/*=== Yandex API ===*/
ymaps.ready(init);

var myPlacemarkMap,
    myPlacemark1;

function init(){
    myPlacemarkMap = new ymaps.Map("map", {
        center: [53.218298, 44.988986],
        zoom: 17
    });

    myPlacemarkMap.controls
        .remove('zoomControl')
        .remove('geolocationControl')
        .remove('trafficControl')
        .remove('typeSelector')
        .remove('fullscreenControl')
        .remove('searchControl');

    myPlacemarkMap.behaviors.disable([
        'drag',
        'scrollZoom'
    ]);

    myPint = new ymaps.GeoObjectCollection(null, {
        // iconLayout: 'default#image',
        preset: 'islands#redIcon',
        //iconImageHref: 'img/map-marker.png',
        iconImageSize: [46, 57],
        iconImageOffset: [-30, -60]
    });

    myPlacemark1 = new ymaps.Placemark([53.218298, 44.988986], {
        hintContent: 'Хеликс',
        balloonContentBody: 'До 18:00',
    });



    myPint.add(myPlacemark1);
    myPlacemarkMap.geoObjects.add(myPint);
}