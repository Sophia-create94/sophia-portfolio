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
      timezone: 'Europe/Berlin', // ← change this as you travel, e.g. 'America/New_York', 'Asia/Bangkok'
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

  // Hero signature: the coral phrase "bring them to life" comes alive — a soft 3D lean + coral glow
  // that follows the cursor, and rests when still. Pointer devices only; off for reduced-motion / touch.
  (function(){
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if(!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches)) return;
    var el = document.getElementById('rotate');
    var hero = document.querySelector('.hero');
    if(!el || !hero) return;

    var tX=0, tY=0, tRX=0, tRY=0, tG=0;   // targets
    var X=0, Y=0, RX=0, RY=0, G=0;         // eased current
    var running=false;

    function onMove(e){
      var r = el.getBoundingClientRect();
      var hr = hero.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width/2);
      var dy = e.clientY - (r.top + r.height/2);
      var nx = Math.max(-1, Math.min(1, dx / (hr.width/2)));
      var ny = Math.max(-1, Math.min(1, dy / (hr.height/2)));
      tRY = nx * 7;     // lean toward the cursor (deg)
      tRX = -ny * 5;
      tX  = nx * 5;     // slight drift (px)
      tY  = ny * 3;
      tG  = Math.max(0, 1 - Math.hypot(dx, dy) / 380); // glow rises as the cursor nears
      if(!running){ running = true; requestAnimationFrame(loop); }
    }
    function onLeave(){ tX=tY=tRX=tRY=tG=0; }

    function loop(){
      X  += (tX  - X)  * 0.12; Y  += (tY  - Y)  * 0.12;
      RX += (tRX - RX) * 0.12; RY += (tRY - RY) * 0.12;
      G  += (tG  - G)  * 0.10;
      el.style.transform = 'translate('+X.toFixed(2)+'px,'+Y.toFixed(2)+'px) rotateX('+RX.toFixed(2)+'deg) rotateY('+RY.toFixed(2)+'deg)';
      el.style.textShadow = G>0.01 ? '0 0 '+(28*G).toFixed(1)+'px rgba(248,112,96,'+(0.55*G).toFixed(3)+')' : '';
      // keep animating until everything has settled back to rest
      var atRest = Math.abs(tX-X)<0.05 && Math.abs(tY-Y)<0.05 && Math.abs(tRX-RX)<0.05 && Math.abs(tRY-RY)<0.05 && Math.abs(tG-G)<0.01;
      if(atRest && tX===0 && tY===0 && tRX===0 && tRY===0 && tG===0){ running=false; el.style.transform=''; el.style.textShadow=''; return; }
      requestAnimationFrame(loop);
    }
    hero.addEventListener('pointermove', onMove);
    hero.addEventListener('pointerleave', onLeave);
  })();


  // Day/night sun-moon icon by local time; a faint star field drifts in the hero at night.
  (function(){
    var el=document.getElementById('daynight');
    var hero=document.querySelector('.hero');
    if(!el && !hero) return;
    var PARIS='Europe/Berlin';
    var reduce=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var RAYS='<line x1="12" y1="2.6" x2="12" y2="5.2"/><line x1="12" y1="18.8" x2="12" y2="21.4"/><line x1="2.6" y1="12" x2="5.2" y2="12"/><line x1="18.8" y1="12" x2="21.4" y2="12"/><line x1="5.4" y1="5.4" x2="7.2" y2="7.2"/><line x1="16.8" y1="16.8" x2="18.6" y2="18.6"/><line x1="16.8" y1="7.2" x2="18.6" y2="5.4"/><line x1="5.4" y1="18.6" x2="7.2" y2="16.8"/>';
    var SUN='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="currentColor"/><g stroke="currentColor" stroke-width="1.7" stroke-linecap="round">'+RAYS+'</g></svg>';
    var MOON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.6A8 8 0 1 1 9.4 4a6.5 6.5 0 0 0 10.6 10.6z" fill="currentColor"/></svg>';
    function hourIn(tz){ try{ return parseInt(new Intl.DateTimeFormat('en-US',{hour:'numeric',hourCycle:'h23',timeZone:tz}).format(new Date()),10); }catch(e){ return new Date().getHours(); } }
    function isDay(){ var h=hourIn(PARIS); return h>=9 && h<22; }  // sun 9:00-21:59, moon 22:00-8:59
    var cv=null, ctx=null, stars=[], W=0,H=0,DPR=1, running=false, night=false;
    if(hero){ cv=document.createElement('canvas'); cv.id='starfield'; cv.setAttribute('aria-hidden','true'); hero.insertBefore(cv, hero.firstChild); ctx=cv.getContext('2d'); size(); window.addEventListener('resize', size); }
    function size(){ if(!cv) return; DPR=Math.min(window.devicePixelRatio||1,2); var r=hero.getBoundingClientRect(); W=r.width;H=r.height; cv.width=Math.max(1,W*DPR); cv.height=Math.max(1,H*DPR); ctx.setTransform(DPR,0,0,DPR,0,0); make(); if(night) draw(0); }
    function make(){ stars=[]; var n=Math.max(24, Math.round(W*H/11000)); for(var i=0;i<n;i++){ stars.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.2+0.3,ph:Math.random()*6.28,sp:0.4+Math.random()*0.9,vx:-(0.04+Math.random()*0.12)}); } }
    function draw(t){ ctx.clearRect(0,0,W,H); for(var i=0;i<stars.length;i++){ var s=stars[i]; if(!reduce){ s.x+=s.vx; if(s.x<-2){ s.x=W+2; s.y=Math.random()*H; } } var a=reduce?0.55:(0.3+0.5*(0.5+0.5*Math.sin(t/900*s.sp+s.ph))); ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,7); ctx.fillStyle='rgba(255,255,255,'+a.toFixed(2)+')'; ctx.fill(); } }
    function loop(t){ if(!night||reduce){ running=false; return; } draw(t); requestAnimationFrame(loop); }
    function render(){
      night=!isDay();
      if(el){ el.classList.remove('dn-sun','dn-moon'); el.classList.add(night?'dn-moon':'dn-sun'); el.innerHTML=night?MOON:SUN; el.setAttribute('title', night?'Night where I am':'Daytime where I am'); el.classList.add('in'); }
      if(cv){ cv.classList.toggle('on', night); if(night){ if(reduce){ draw(0); } else if(!running){ running=true; requestAnimationFrame(loop); } } else { ctx.clearRect(0,0,W,H); } }
    }
    render(); setInterval(render, 60000);
  })();

  // Coffee mug by the Connect links: hover shows the invite; a click just pours a splash of oat milk.
  (function(){
    var wrap=document.querySelector('.pxcup-wrap'); if(!wrap) return;
    var cup=wrap.querySelector('.pxcup'); var drop=cup.querySelector('.cdrop'), rip=cup.querySelector('.cripple'), brew=cup.querySelector('.brew');
    wrap.addEventListener('click', function(){
      if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if(drop) drop.classList.remove('go'); if(rip) rip.classList.remove('go'); void cup.getBoundingClientRect();
      if(drop) drop.classList.add('go'); if(rip) rip.classList.add('go');
      if(brew){ brew.style.transition='opacity .5s'; brew.style.opacity='1'; setTimeout(function(){ brew.style.opacity=''; }, 700); }
    });
  })();
