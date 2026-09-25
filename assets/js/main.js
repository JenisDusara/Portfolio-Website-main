(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- Theme ---------- */
  const themeBtn = $('#theme-toggle');
  const setThemeIcon = () => {
    themeBtn.innerHTML = root.dataset.theme === 'light'
      ? '<i class="fa-solid fa-moon"></i>'
      : '<i class="fa-solid fa-sun"></i>';
  };
  setThemeIcon();
  themeBtn.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
    setThemeIcon();
  });

  /* ---------- Mobile menu ---------- */
  const nav = $('#nav');
  const menuBtn = $('#menu-toggle');
  const closeMenu = () => {
    nav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
  };
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
  });
  $$('a', nav).forEach(a => a.addEventListener('click', closeMenu));

  /* ---------- Active nav link ---------- */
  const links = $$('a', nav);
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => sectionObserver.observe(s));

  /* ---------- Scroll progress + back to top ---------- */
  const progress = $('.scroll-progress span');
  const toTop = $('#to-top');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleY(${max > 0 ? scrollY / max : 0})`;
    toTop.classList.toggle('show', scrollY > 600);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', () => scrollTo({ top: 0 }));

  /* ---------- Reveal on scroll ---------- */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  $$('.reveal').forEach(el => revealObserver.observe(el));

  /* ---------- Rotating role ---------- */
  const roles = ['AI/ML Engineer', 'RAG Developer', 'Full-Stack Developer', 'Python Developer'];
  const roleEl = $('#role');
  if (!reduceMotion) {
    let r = 0;
    setInterval(() => {
      roleEl.classList.add('out');
      setTimeout(() => {
        r = (r + 1) % roles.length;
        roleEl.textContent = roles[r];
        roleEl.classList.remove('out');
      }, 350);
    }, 2800);
  }

  /* ---------- RAG pipeline animation ---------- */
  const stages = $$('.stage');
  const statusRows = $$('#pipe-status em');
  const bar = $('#pipe-bar');
  const log = $('#pipe-log');
  const logs = [
    'parsing documents (pdf, docx, pptx)...',
    'splitting into semantic chunks...',
    'generating embeddings → vector store...',
    'retrieving top-k relevant chunks...',
    'generating grounded answer ✓'
  ];
  let step = 0;
  const runPipeline = () => {
    stages.forEach((s, idx) => {
      s.classList.toggle('done', idx < step);
      s.classList.toggle('active', idx === step);
    });
    statusRows.forEach((em, idx) => {
      em.className = idx < step ? 'done' : idx === step ? 'active' : '';
      em.textContent = idx < step ? 'done' : idx === step ? 'active' : 'waiting...';
    });
    bar.style.width = ((step + 1) / stages.length) * 100 + '%';
    log.innerHTML = '<span class="accent">&gt;</span> ' + logs[step];
    step = (step + 1) % stages.length;
  };
  runPipeline();
  if (!reduceMotion) setInterval(runPipeline, 1700);

  /* ---------- Skills terminal ---------- */
  const skills = {
    'ai/ml': ['TensorFlow', 'PyTorch', 'Scikit-learn', 'Hugging Face', 'OpenCV', 'YOLOv8', 'Deep Learning', 'NLP', 'Computer Vision', 'Feature Engineering', 'Model Evaluation'],
    'llm/rag': ['RAG', 'LLMs', 'Prompt Engineering', 'Embeddings', 'FAISS', 'ChromaDB', 'Pinecone'],
    'backend': ['Python', 'FastAPI', 'Flask', 'REST APIs'],
    'databases': ['MySQL', 'PostgreSQL', 'MongoDB', 'SQL', 'NoSQL'],
    'data/viz': ['Pandas', 'NumPy', 'Power BI', 'Matplotlib', 'Jupyter Notebook'],
    'devops': ['Git', 'GitHub', 'Docker', 'Linux', 'VS Code'],
    'web': ['HTML', 'CSS']
  };
  const domains = Object.keys(skills);
  const tabs = $('#term-tabs');
  const list = $('#term-list');
  const domainEl = $('#term-domain');
  const meta = $('#term-meta');
  let current = 0;
  let cycle;

  domains.forEach((d, idx) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = d;
    b.setAttribute('role', 'tab');
    b.addEventListener('click', () => { showDomain(idx); restartCycle(); });
    tabs.appendChild(b);
  });

  function showDomain(idx) {
    current = idx;
    const d = domains[idx];
    domainEl.textContent = d;
    list.innerHTML = skills[d].map((s, n) => `<li style="animation-delay:${n * 45}ms">${s}</li>`).join('');
    meta.textContent = `> ${skills[d].length} matches · 0.00${3 + (idx % 6)}s`;
    $$('button', tabs).forEach((b, n) => {
      b.classList.toggle('active', n === idx);
      b.setAttribute('aria-selected', String(n === idx));
    });
  }
  function restartCycle() {
    clearInterval(cycle);
    if (!reduceMotion) cycle = setInterval(() => showDomain((current + 1) % domains.length), 4200);
  }
  showDomain(0);
  restartCycle();

  /* ---------- Copy email ---------- */
  const toast = $('#toast');
  let toastTimer;
  const showToast = msg => {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
  };
  $('#copy-email').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('jenishdusara78@gmail.com');
      showToast('Email copied ✓');
    } catch (e) {
      location.href = 'mailto:jenishdusara78@gmail.com';
    }
  });

  $('#year').textContent = new Date().getFullYear();

  /* ---------- Target cursor (desktop only) ---------- */
  if (finePointer && !reduceMotion) {
    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.innerHTML = `
      <div class="cursor-idle">
        <svg viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="1.8" fill="var(--cursor)"/></svg>
        <svg class="spin" viewBox="0 0 28 28" fill="none" stroke="var(--cursor)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="10,6 14,2 18,6"/><polyline points="22,10 26,14 22,18"/>
          <polyline points="18,22 14,26 10,22"/><polyline points="6,18 2,14 6,10"/>
        </svg>
      </div>
      <div class="cursor-target"><span></span><span></span><span></span><span></span></div>`;
    document.body.appendChild(cursor);
    root.classList.add('has-cursor');

    const SIZE = 38, PAD = 7;
    const mouse = { x: innerWidth / 2, y: innerHeight / 2 };
    const pos = { x: mouse.x - SIZE / 2, y: mouse.y - SIZE / 2, w: SIZE, h: SIZE };
    let target = null;
    const interactive = 'a, button, [role="tab"]';

    addEventListener('pointermove', e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      cursor.classList.add('ready');
      target = e.target.closest(interactive);
    });
    document.addEventListener('pointerleave', () => cursor.classList.remove('ready'));
    addEventListener('pointerdown', () => cursor.classList.add('pressed'));
    addEventListener('pointerup', () => cursor.classList.remove('pressed'));

    const loop = () => {
      let tx, ty, tw, th;
      if (target && target.isConnected) {
        const r = target.getBoundingClientRect();
        tx = r.left - PAD; ty = r.top - PAD; tw = r.width + PAD * 2; th = r.height + PAD * 2;
        cursor.classList.add('locked');
      } else {
        tx = mouse.x - SIZE / 2; ty = mouse.y - SIZE / 2; tw = SIZE; th = SIZE;
        cursor.classList.remove('locked');
      }
      const k = target ? 0.22 : 0.35;
      pos.x += (tx - pos.x) * k;
      pos.y += (ty - pos.y) * k;
      pos.w += (tw - pos.w) * k;
      pos.h += (th - pos.h) * k;
      cursor.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      cursor.style.width = pos.w + 'px';
      cursor.style.height = pos.h + 'px';
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------- Interactive node field ---------- */
  const canvas = $('#field');
  const ctx = canvas.getContext('2d');
  const pointer = { x: -9999, y: -9999 };
  let w, h, dpr, nodes = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = innerWidth * dpr;
    h = canvas.height = innerHeight * dpr;
    const count = Math.round(Math.min(140, (innerWidth * innerHeight) / 10000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.45 * dpr,
      vy: (Math.random() - 0.5) * 0.45 * dpr,
      r: (Math.random() * 1.6 + 0.9) * dpr
    }));
  }

  function draw() {
    const rgb = getComputedStyle(root).getPropertyValue('--field-dot').trim();
    const linkDist = 140 * dpr;
    const mouseDist = 200 * dpr;
    ctx.clearRect(0, 0, w, h);

    for (const n of nodes) {
      if (!reduceMotion) { n.x += n.vx; n.y += n.vy; }
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;

      const mdx = pointer.x - n.x, mdy = pointer.y - n.y;
      const md = Math.hypot(mdx, mdy);
      if (md < mouseDist) {
        n.x += mdx * 0.004;
        n.y += mdy * 0.004;
        ctx.strokeStyle = `rgba(${rgb}, ${0.6 * (1 - md / mouseDist)})`;
        ctx.lineWidth = dpr;
        ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(pointer.x, pointer.y); ctx.stroke();
      }

      ctx.fillStyle = `rgba(${rgb}, 0.65)`;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < linkDist) {
          ctx.strokeStyle = `rgba(${rgb}, ${0.24 * (1 - d / linkDist)})`;
          ctx.lineWidth = dpr * 0.8;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  addEventListener('resize', resize);
  addEventListener('pointermove', e => { pointer.x = e.clientX * dpr; pointer.y = e.clientY * dpr; });
  document.addEventListener('pointerleave', () => { pointer.x = pointer.y = -9999; });
  resize();
  draw();
})();
