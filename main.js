  // One restrained AI beat: the closing phrase cycles once on load, then settles and stays silent.
  // No aria-live, so screen readers announce only the final, default phrase ("bring them to life").
  (function(){
    var el = document.getElementById('rotate');
    if(!el) return;
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // keep the default phrase
    var phrases = ['prototype them','iterate on them','refine them','bring them to life']; // settles on the default
    function run(){
      // Lock only the height to the final phrase so the line count never reflows mid-animation.
      // No min-width: the phrase sits at the line's end (nothing after it shifts), and a fixed
      // width would overflow narrow/mobile screens.
      var r = el.getBoundingClientRect();
      el.style.minHeight = Math.ceil(r.height) + 'px';
      var i = 0;
      el.textContent = phrases[0]; // animated users start on "prototype them"; static fallback shows "bring them to life"
      function step(){
        el.classList.add('swap');
        setTimeout(function(){
          i++;
          el.textContent = phrases[i];
          el.classList.remove('swap');
          if(i < phrases.length - 1){ setTimeout(step, 950); } // settles on the last phrase, then stop
        }, 460);
      }
      setTimeout(step, 1100); // brief pause as the headline reveals, then run
    }
    // Measure with the real heading font so the reserved box is correct.
    if(document.fonts && document.fonts.ready){ document.fonts.ready.then(run); } else { run(); }
  })();

  // Looping app preview: autoplays for everyone except reduced-motion users, who get the static poster.
  (function(){
    var v = document.querySelector('.ff-video');
    if(!v) return;
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      v.removeAttribute('autoplay');
      v.pause();
      v.load(); // reset to the poster frame so no video frame is shown
    }
  })();

  // Live local time + auto location label next to the "now" line.
  // As you travel, change ONE thing: LOCATION.timezone (IANA name). The clock AND the country
  // label both follow it. Only set LOCATION.country to override a zone that's not in the map below.
  (function(){
    var LOCATION = {
      timezone: 'Europe/Rome', // ← change this as you travel, e.g. 'America/New_York', 'Asia/Bangkok'
      country: ''              // optional override; '' = auto-derive the country from the timezone
    };
    // IANA timezone → country label. Add a line here if you land somewhere new.
    var TZ_COUNTRY = {
      'Europe/Rome':'Italy','Europe/Berlin':'Germany','Europe/Lisbon':'Portugal','Europe/Madrid':'Spain',
      'Europe/Paris':'France','Europe/Amsterdam':'the Netherlands','Europe/Brussels':'Belgium','Europe/Vienna':'Austria',
      'Europe/Zurich':'Switzerland','Europe/Prague':'Czechia','Europe/Budapest':'Hungary','Europe/Warsaw':'Poland',
      'Europe/Athens':'Greece','Europe/Bucharest':'Romania','Europe/Sofia':'Bulgaria','Europe/Belgrade':'Serbia',
      'Europe/Zagreb':'Croatia','Europe/Ljubljana':'Slovenia','Europe/Bratislava':'Slovakia','Europe/Tallinn':'Estonia',
      'Europe/Riga':'Latvia','Europe/Vilnius':'Lithuania','Europe/Dublin':'Ireland','Europe/London':'the UK',
      'Europe/Copenhagen':'Denmark','Europe/Stockholm':'Sweden','Europe/Oslo':'Norway','Europe/Helsinki':'Finland',
      'Europe/Malta':'Malta','Atlantic/Canary':'the Canary Islands','Atlantic/Madeira':'Madeira','Atlantic/Reykjavik':'Iceland',
      'Asia/Bangkok':'Thailand','Asia/Jakarta':'Indonesia','Asia/Ho_Chi_Minh':'Vietnam','Asia/Tokyo':'Japan',
      'Asia/Dubai':'the UAE','Africa/Casablanca':'Morocco','Africa/Johannesburg':'South Africa','America/New_York':'the US',
      'America/Los_Angeles':'the US','America/Mexico_City':'Mexico','America/Sao_Paulo':'Brazil','America/Bogota':'Colombia',
      'America/Argentina/Buenos_Aires':'Argentina','Australia/Sydney':'Australia'
    };
    function prettyPlace(tz){ return String(tz).split('/').pop().replace(/_/g,' '); } // fallback: the city in the zone
    var country = LOCATION.country || TZ_COUNTRY[LOCATION.timezone] || prettyPlace(LOCATION.timezone);
    var loc = document.getElementById('nomad-loc');
    if(loc && country) loc.textContent = country;

    var el = document.getElementById('localtime');
    if(!el) return;
    function tick(){
      try{
        var raw = new Intl.DateTimeFormat('en-US',{hour:'numeric',minute:'2-digit',hour12:true,timeZone:LOCATION.timezone}).format(new Date());
        el.textContent = raw.replace(':','.');
      }catch(e){ /* invalid timezone → show nothing */ }
    }
    tick();
    setInterval(tick, 30000);
  })();  // Experiment icon(s): a catchy wiggle on their own — once shortly after load, then every few seconds.
  (function(){
    var icons = document.querySelectorAll('.navicon');
    if(!icons.length) return;
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    function wiggle(){
      icons.forEach(function(ni){
        ni.classList.add('wiggle');
        setTimeout(function(){ ni.classList.remove('wiggle'); }, 700);
      });
    }
    setTimeout(function(){
      wiggle();
      setInterval(wiggle, 6000);
    }, 1000);
  })();  // Back-to-top: appears once the Experiments section reaches the screen, scrolls to top on click.
  (function(){
    var btn = document.querySelector('.totop');
    var lab = document.getElementById('lab');
    if(!btn || !lab) return;
    function onScroll(){
      var show;
      if(window.innerWidth <= 860){
        // mobile: show after roughly one screen of scroll (much earlier than the Experiments section)
        show = window.scrollY > window.innerHeight * 0.8;
      } else {
        // desktop: show as soon as the Experiments section scrolls into view
        show = lab.getBoundingClientRect().top < window.innerHeight;
      }
      btn.classList.toggle('show', show);
    }
    window.addEventListener('scroll', onScroll, {passive:true});
    window.addEventListener('resize', onScroll);
    onScroll();
    btn.addEventListener('click', function(){
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  })();

  // Smooth scroll motion (rAF + eased): the opaque nav lifts away cleanly, and the hero lines drift apart.
  (function(){
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var bar = document.querySelector('.topbar');
    var l1 = document.querySelector('.hl-l1'), l2 = document.querySelector('.hl-l2');
    var drift = window.innerWidth > 860;
    var target = window.scrollY, cur = target;

    function apply(y){
      if(bar){
        var s = 40, e = 190;                                       // lingers ~40px, fully lifted by ~190px
        var p = y <= s ? 0 : y >= e ? 1 : (y - s) / (e - s);
        bar.style.transform = 'translateY(' + (-p * 101) + '%)';   // slides up, stays opaque — no see-through
        bar.style.pointerEvents = p > 0.95 ? 'none' : '';
      }
      if(drift && l1 && l2){
        var d = Math.min(y / 420, 1) * 36;
        l1.style.transform = 'translateX(' + (-d) + 'px)';
        l2.style.transform = 'translateX(' + d + 'px)';
      }
    }
    function loop(){
      cur += (target - cur) * 0.14;                                // eased follow → buttery, Framer-like
      if(Math.abs(target - cur) < 0.15) cur = target;
      apply(cur);
      requestAnimationFrame(loop);
    }
    window.addEventListener('scroll', function(){ target = window.scrollY; }, {passive:true});
    window.addEventListener('resize', function(){
      drift = window.innerWidth > 860;
      if(!drift && l1){ l1.style.transform = ''; l2.style.transform = ''; }
    });
    setTimeout(function(){                                          // let the entrance play, then take over the transform
      if(bar) bar.classList.remove('reveal');
      cur = target = window.scrollY;
      loop();
    }, 1050);
  })();

  // Projects rise into view on scroll; the big number slides in just after.
  (function(){
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if(!('IntersectionObserver' in window)) return;
    var els = document.querySelectorAll('.project, .about-copy, .about-pov, .lab-band .work-label, .lab-intro, .lab-grid, .lab-proof');
    els.forEach(function(el){ el.classList.add('reveal-up'); });
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function(el){ io.observe(el); });
  })();

  // Mobile hamburger: toggle the top-nav dropdown.
  (function(){
    var btn = document.querySelector('.nav-toggle');
    var nav = document.getElementById('topnav');
    if(!btn || !nav) return;
    function setOpen(open){
      nav.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    btn.addEventListener('click', function(){ setOpen(!nav.classList.contains('open')); });
    // close after tapping a link, or on Escape
    nav.addEventListener('click', function(e){ if(e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') setOpen(false); });
    document.addEventListener('click', function(e){ if(nav.classList.contains('open') && !nav.contains(e.target) && !btn.contains(e.target)) setOpen(false); });
  })();
