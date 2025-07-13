document.addEventListener('DOMContentLoaded', function() {

    // =================================================================
    // --- FUNGSI UNIVERSAL (TIDAK DIUBAH) ---
    // =================================================================

    const header = document.getElementById('main-header');
    lucide.createIcons();

    function handleScroll() {
        if (!header) return;
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    function observeSections() {
        const sections = document.querySelectorAll('.content-section, .hero-section');
        if (!sections.length) return;
        const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
        const sectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        sections.forEach(section => { sectionObserver.observe(section); });
    }

    function themeToggle() {
        const themeToggleButton = document.getElementById('theme-toggle');
        if (!themeToggleButton || !document.body.id) return;
        const pageId = document.body.id.replace('page-', '');
        const storageKey = `theme-${pageId}`; 
        const sunIcon = `<i data-lucide="sun"></i>`;
        const moonIcon = `<i data-lucide="moon"></i>`;
        const applyTheme = (theme) => {
            if (theme === 'light') {
                document.body.classList.add('light-mode');
                themeToggleButton.innerHTML = moonIcon;
            } else {
                document.body.classList.remove('light-mode');
                themeToggleButton.innerHTML = sunIcon;
            }
            lucide.createIcons();
        };
        let currentTheme = localStorage.getItem(storageKey) || 'dark';
        applyTheme(currentTheme);
        themeToggleButton.addEventListener('click', () => {
            currentTheme = document.body.classList.contains('light-mode') ? 'dark' : 'light';
            localStorage.setItem(storageKey, currentTheme);
            applyTheme(currentTheme);
        });
    }
    
    function pageTransition() {
        const transitioner = document.getElementById('page-transitioner');
        const bubble = document.getElementById('transition-bubble');
        if (!transitioner || !bubble) return;
        const handleLinkClick = (event, link) => {
            const linkHref = link.getAttribute('href');
            if (link.target === '_blank' || linkHref.startsWith('#') || link.hostname !== window.location.hostname || !link.pathname.endsWith('.html')) {
                return; 
            }
            event.preventDefault();
            const targetUrl = link.href;
            let destinationPage;
            if (targetUrl.includes('gallery.html')) destinationPage = 'gallery';
            else if (targetUrl.includes('tools.html')) destinationPage = 'tools';
            else destinationPage = 'index';
            const destinationStorageKey = `theme-${destinationPage}`;
            const destinationTheme = localStorage.getItem(destinationStorageKey) || 'dark';
            const bubbleColor = destinationTheme === 'light' ? '#f4f4f9' : '#121212';
            bubble.style.backgroundColor = bubbleColor;
            transitioner.classList.add('is-active');
            bubble.style.left = `${event.clientX}px`;
            bubble.style.top = `${event.clientY}px`;
            bubble.classList.add('is-expanding');
            setTimeout(() => { window.location.href = targetUrl; }, 700);
        };
        document.body.addEventListener('click', (event) => {
            const link = event.target.closest('a');
            if (link) {
                handleLinkClick(event, link);
            }
        });
        window.addEventListener('pageshow', (event) => {
            if (event.persisted) {
                transitioner.classList.remove('is-active');
                bubble.classList.remove('is-expanding');
            }
        });
    }
           
    // =================================================================
    // --- FUNGSI SPESIFIK HALAMAN (TIDAK DIUBAH KECUALI GALERI) ---
    // =================================================================

    function initPageIndex() {
        const typedTextSpan = document.getElementById("typed-text");
        if (typedTextSpan) {
            const textArray = ["CxZ", "Mahasiswa Informatika"]; 
            const typingDelay = 100, erasingDelay = 50, newTextDelay = 2000;
            let textArrayIndex = 0, charIndex = 0;
            function type() { if (charIndex < textArray[textArrayIndex].length) { typedTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex); charIndex++; setTimeout(type, typingDelay); } else { setTimeout(erase, newTextDelay); } }
            function erase() { if (charIndex > 0) { typedTextSpan.textContent = textArray[textArrayIndex].substring(0, charIndex - 1); charIndex--; setTimeout(erase, erasingDelay); } else { textArrayIndex++; if (textArrayIndex >= textArray.length) textArrayIndex = 0; setTimeout(type, typingDelay + 1100); } }
            if (textArray.length) setTimeout(type, newTextDelay + 250);
        }
        const navLinks = document.querySelectorAll('nav a');
        const sections = document.querySelectorAll('main > section');
        function updateActiveLink() {
            if (!sections.length || !header) return;
            let currentSectionId = '';
            sections.forEach(section => {
                if (window.scrollY >= section.offsetTop - header.offsetHeight - 20) {
                    currentSectionId = section.getAttribute('id');
                }
            });
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.hash && link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                } else if (!currentSectionId && link.getAttribute('href') === '#hero') {
                    link.classList.add('active');
                }
            });
        }
        window.addEventListener('scroll', updateActiveLink);
        updateActiveLink();
        const modalContainer = document.getElementById('email-modal');
        const openModalBtn = document.getElementById('email-button');
        const closeModalBtn = document.getElementById('close-modal');
        if (modalContainer && openModalBtn && closeModalBtn) {
            openModalBtn.addEventListener('click', () => modalContainer.classList.add('visible'));
            closeModalBtn.addEventListener('click', () => modalContainer.classList.remove('visible'));
            modalContainer.addEventListener('click', (e) => { if (e.target === modalContainer) modalContainer.classList.remove('visible'); });
            document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modalContainer.classList.contains('visible')) modalContainer.classList.remove('visible'); });
        }
        const form = document.getElementById('contact-form');
        if (form) {
            const status = document.getElementById('form-status');
            async function handleSubmit(event) {
                event.preventDefault();
                const data = new FormData(event.target);
                try {
                    const response = await fetch(event.target.action, { method: form.method, body: data, headers: { 'Accept': 'application/json' } });
                    if (response.ok) {
                        status.textContent = "Terima kasih! Pesan Anda telah terkirim.";
                        status.style.color = 'lightgreen';
                        form.reset();
                    } else {
                        const responseData = await response.json();
                        status.textContent = responseData.errors ? responseData.errors.map(e => e.message).join(", ") : "Oops! Terjadi masalah.";
                        status.style.color = 'red';
                    }
                } catch (error) {
                    status.textContent = "Oops! Terjadi masalah saat mengirim pesan.";
                    status.style.color = 'red';
                }
            }
            form.addEventListener("submit", handleSubmit);
        }
    }

    /**
     * [REKOMBINASI FINAL] Inisialisasi galeri dengan filter, dan audio player canggih di dalam modal.
     */
    function initPageGallery() {
        // --- Referensi Elemen Global ---
        const filterButtons = document.querySelectorAll('.filter-btn');
        const galleryItems = document.querySelectorAll('.gallery-item-new');
        const audioPlayer = document.getElementById('gallery-audio-player');
        
        // --- Referensi Elemen Modal ---
        const modalOverlay = document.getElementById('gallery-modal-overlay');
        const modalImage = document.getElementById('gallery-modal-image');
        const modalTitle = document.getElementById('gallery-modal-title');
        const modalDescription = document.getElementById('gallery-modal-description');
        const closeModalButton = document.getElementById('gallery-modal-close');
        
        // --- Referensi Elemen Audio Player di Dalam Modal ---
        const modalAudioControls = document.getElementById('modal-audio-controls');
        const playPauseBtn = document.getElementById('modal-play-pause-btn');
        const progressBar = document.getElementById('modal-progress-bar');
        const modalAudioTitle = document.getElementById('modal-audio-title');

        if (!galleryItems.length || !modalOverlay || !audioPlayer) return;

        let currentPlayingCard = null;

        // --- Fitur 1: Logika Filter Kategori ---
        function setupFiltering() {
            if (!filterButtons.length) return;
            filterButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const filterValue = button.dataset.filter;
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    galleryItems.forEach(item => {
                        item.classList.add('hidden');
                        item.classList.remove('fade-in');
                        const itemCategory = item.dataset.category;
                        if (filterValue === 'all' || filterValue === itemCategory) {
                            setTimeout(() => {
                                item.classList.remove('hidden');
                                item.classList.add('fade-in');
                            }, 10);
                        }
                    });
                });
            });
        }

        // --- Fitur 2: Logika Interaksi Kartu (Modal & Audio) ---
        function setupModalInteraction() {
            galleryItems.forEach(item => {
                item.addEventListener('click', () => {
                    const audioSrc = item.dataset.audioSrc;

                    // Tampilkan/sembunyikan kontrol audio di modal berdasarkan data-audio-src
                    modalAudioControls.style.display = audioSrc ? 'flex' : 'none';

                    // Isi konten modal
                    modalImage.src = item.dataset.fullImage;
                    modalTitle.textContent = item.dataset.title;
                    modalDescription.textContent = item.dataset.description;
                    modalOverlay.classList.add('visible');
                    
                    if (currentPlayingCard) {
                        currentPlayingCard.classList.remove('playing');
                    }
                    
                    if (audioSrc) {
                        currentPlayingCard = item;
                        // Hanya set audio source tanpa auto-play
                        if (audioPlayer.src !== audioSrc) {
                           audioPlayer.src = audioSrc;
                        }
                        // Hentikan audio dan reset tombol play
                        audioPlayer.pause();
                        playPauseBtn.innerHTML = `<i data-lucide="play"></i>`;
                        modalAudioTitle.textContent = item.dataset.audioTitle || 'Audio tersedia';
                        lucide.createIcons();
                    } else {
                        audioPlayer.pause();
                        audioPlayer.src = '';
                        currentPlayingCard = null;
                        modalAudioTitle.textContent = 'Audio tidak tersedia';
                    }
                });
            });
        }

        // --- Fitur 3: Kontrol Audio Player di Modal ---
        function setupAudioControls() {
            playPauseBtn.addEventListener('click', () => {
                if (audioPlayer.paused) {
                    modalAudioTitle.textContent = 'Memuat...';
                    audioPlayer.play();
                } else {
                    audioPlayer.pause();
                }
            });

            audioPlayer.addEventListener('loadstart', () => {
                modalAudioTitle.textContent = 'Memuat audio...';
            });

            audioPlayer.addEventListener('canplay', () => {
                if (currentPlayingCard) {
                    modalAudioTitle.textContent = currentPlayingCard.dataset.audioTitle || 'Audio siap diputar';
                }
            });

            audioPlayer.addEventListener('play', () => {
                playPauseBtn.innerHTML = `<i data-lucide="pause"></i>`;
                if (currentPlayingCard) {
                    modalAudioTitle.textContent = `🎵 ${currentPlayingCard.dataset.audioTitle || 'Sedang diputar...'}`;
                }
                lucide.createIcons();
            });

            audioPlayer.addEventListener('pause', () => {
                playPauseBtn.innerHTML = `<i data-lucide="play"></i>`;
                if (currentPlayingCard) {
                    modalAudioTitle.textContent = currentPlayingCard.dataset.audioTitle || 'Audio dijeda';
                }
                lucide.createIcons();
            });

            audioPlayer.addEventListener('timeupdate', () => {
                if (audioPlayer.duration) {
                    const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
                    progressBar.style.width = `${progressPercent}%`;
                }
            });

             audioPlayer.addEventListener('ended', () => {
                progressBar.style.width = '0%';
                if(currentPlayingCard) {
                    currentPlayingCard.classList.remove('playing');
                    modalAudioTitle.textContent = `${currentPlayingCard.dataset.audioTitle || 'Audio'} - Selesai`;
                }
                currentPlayingCard = null;
            });
        }

        // --- Fitur 4: Fungsi Menutup Modal ---
        const closeModal = () => {
            modalOverlay.classList.remove('visible');
            audioPlayer.pause();
            if (currentPlayingCard) {
                currentPlayingCard.classList.remove('playing');
                currentPlayingCard = null;
            }
        };
        
        closeModalButton.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modalOverlay.classList.contains('visible')) closeModal(); });

        // --- Fitur 5: Background Interaktif ---
        function initInteractiveBackground() {
            const body = document.querySelector('body#page-gallery');
            if (!body) return;
            body.addEventListener('mousemove', (e) => {
                body.style.setProperty('--x', e.clientX + 'px');
                body.style.setProperty('--y', e.clientY + 'px');
            });
        }

        // Panggil semua fungsi inisialisasi untuk halaman galeri
        setupFiltering();
        setupModalInteraction();
        setupAudioControls();
        initInteractiveBackground();
    }


    function initPageTools() {
        function initEncoderDecoderTool() {
            const modal = document.getElementById('encoder-decoder-modal');
            const openBtn = document.getElementById('open-encoder-decoder');
            const closeBtn = document.getElementById('close-encoder-decoder');
            if (!modal || !openBtn || !closeBtn) return;
    
            const input = document.getElementById('encoder-input');
            const output = document.getElementById('encoder-output');
            const typeSelect = document.getElementById('encoder-type');
            const swapBtn = document.getElementById('swap-io');
            const copyBtn = modal.querySelector('.btn-copy');
    
            async function process() {
                const operation = typeSelect.value;
                const text = input.value;
                if (!text) { output.value = ''; return; }
                let result = '';
                try {
                    switch (operation) {
                        case 'encode-base64': result = btoa(unescape(encodeURIComponent(text))); break;
                        case 'decode-base64': result = decodeURIComponent(escape(atob(text))); break;
                        case 'encode-url': result = encodeURIComponent(text); break;
                        case 'decode-url': result = decodeURIComponent(text); break;
                        case 'hash-sha256':
                            const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
                            const hashArray = Array.from(new Uint8Array(hashBuffer));
                            result = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                            break;
                        case 'case-upper': result = text.toUpperCase(); break;
                        case 'case-lower': result = text.toLowerCase(); break;
                        default: result = 'Operasi tidak valid';
                    }
                } catch (e) { result = `Error: ${e.message}`; }
                output.value = result;
            }
    
            openBtn.addEventListener('click', (e) => { e.preventDefault(); modal.classList.add('visible'); });
            closeBtn.addEventListener('click', () => modal.classList.remove('visible'));
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('visible'); });
            input.addEventListener('input', process);
            typeSelect.addEventListener('change', process);
            swapBtn.addEventListener('click', () => {
                if (output.value.startsWith('Error:')) return;
                [input.value, output.value] = [output.value, input.value];
                process();
            });
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(output.value).then(() => {
                    const originalText = copyBtn.textContent;
                    copyBtn.textContent = 'Disalin!';
                    setTimeout(() => { copyBtn.textContent = originalText; }, 2000);
                });
            });
        }
    
        async function initNetworkInfoTool() {
            if (typeof getIPInfo === 'undefined') {
                window.getIPInfo = async () => fetch('https://ipapi.co/json/').then(res => res.json());
            }
            if (typeof getPrivateIP === 'undefined') {
                window.getPrivateIP = () => new Promise(resolve => resolve('Tidak dapat diakses di browser modern'));
            }
            
            const modal = document.getElementById('network-info-modal');
            const openBtn = document.getElementById('open-network-info');
            const closeBtn = document.getElementById('close-network-info');
            const output = document.getElementById('network-info-output');
            if (!modal || !openBtn || !closeBtn || !output) return;
    
            const openModal = async () => {
                modal.classList.add('visible');
                output.innerHTML = '<p>Memuat data jaringan...</p>';
                const [ipInfoResult, privateIpResult] = await Promise.allSettled([ getIPInfo(), getPrivateIP() ]);
                let html = '<div class="network-info-display"><dl>';
                if (privateIpResult.status === 'fulfilled') html += `<dt>IP Privat</dt><dd>${privateIpResult.value}</dd>`;
                else html += `<dt>IP Privat</dt><dd class="error">Tidak dapat diakses</dd>`;
                
                if (ipInfoResult.status === 'fulfilled' && !ipInfoResult.value.error) {
                    const data = ipInfoResult.value;
                    html += `<dt>IP Publik</dt><dd>${data.ip || 'N/A'}</dd>`;
                    html += `<dt>Lokasi</dt><dd>${data.city || 'N/A'}, ${data.country_name || 'N/A'}</dd>`;
                    html += `<dt>ISP</dt><dd>${data.org || 'N/A'}</dd>`;
                } else {
                     html += `<dt>IP Publik</dt><dd class="error">Gagal memuat</dd>`;
                }
                html += '</dl></div>';
                output.innerHTML = html;
                lucide.createIcons();
            };
    
            openBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
            closeBtn.addEventListener('click', () => modal.classList.remove('visible'));
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('visible'); });
        }
    
        async function initTerminal() {
            try {
                const { terminalCommands } = await import('./terminal-commands.js');
                const container = document.getElementById('terminal-container');
                const openBtn = document.getElementById('open-terminal');
                const closeBtn = document.getElementById('close-terminal');
                const output = document.getElementById('terminal-output');
                const input = document.getElementById('terminal-input');
        
                if (!container || !openBtn || !closeBtn) return;
        
                let commandHistory = [];
                let historyIndex = -1;
                let isExecuting = false;
        
                const welcomeMessage = `CxZ Virtual Terminal v2.0\n(c) 2025 CxZ Corporation.\nKetik "help" untuk memulai.`;
        
                openBtn.addEventListener('click', (e) => { 
                    e.preventDefault(); 
                    container.classList.add('visible'); 
                    if (output.innerHTML === '') output.innerHTML = `<div>${welcomeMessage.replace(/\n/g, '<br>')}</div>`;
                    input.focus();
                });
                closeBtn.addEventListener('click', () => container.classList.remove('visible'));
        
                input.addEventListener('keydown', async (e) => {
                    if (isExecuting) return;
        
                    if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        if (historyIndex < commandHistory.length - 1) {
                            historyIndex++;
                            input.value = commandHistory[historyIndex];
                        }
                    } else if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        if (historyIndex > 0) {
                            historyIndex--;
                            input.value = commandHistory[historyIndex];
                        } else {
                            historyIndex = -1;
                            input.value = '';
                        }
                    }
        
                    if (e.key === 'Enter' && input.value.trim() !== '') {
                        isExecuting = true;
                        const commandLine = input.value.trim();
                        if (commandHistory[0] !== commandLine) commandHistory.unshift(commandLine);
                        historyIndex = -1;
                        input.value = '';
        
                        if (commandLine.toLowerCase() === 'clear') {
                            output.innerHTML = '';
                            isExecuting = false;
                            return; 
                        }
        
                        const [command, ...args] = commandLine.split(' ');
                        output.insertAdjacentHTML('beforeend', `<div><span class="prompt">guest@cxz.me:~$</span> <span>${commandLine}</span></div>`);
                        
                        const cmdFunction = terminalCommands[command.toLowerCase()];
                        if (cmdFunction) {
                            try {
                                const result = await cmdFunction.call(terminalCommands, args, commandHistory);
                                if (result) output.insertAdjacentHTML('beforeend', `<div>${result}</div>`);
                            } catch (err) {
                                output.insertAdjacentHTML('beforeend', `<div class="error">Script error: ${err.message}</div>`);
                            }
                        } else {
                            output.insertAdjacentHTML('beforeend', `<div class="error">command not found: ${command}</div>`);
                        }
                        
                        output.scrollTop = output.scrollHeight;
                        isExecuting = false;
                    }
                });
            } catch (error) {
                console.error("Gagal memuat modul terminal:", error);
                const openBtn = document.getElementById('open-terminal');
                if(openBtn) openBtn.style.display = 'none';
            }
        }
        
        initEncoderDecoderTool();
        initTerminal();
        initNetworkInfoTool();
    }

    // --- EKSEKUSI SCRIPT (TIDAK DIUBAH) ---
    handleScroll();
    themeToggle();
    pageTransition();
    observeSections();

    const bodyId = document.body.id;
    if (bodyId === 'page-index') {
        initPageIndex();
    } else if (bodyId === 'page-gallery') {
        initPageGallery();
    } else if (bodyId === 'page-tools') {
        initPageTools();
    }

    window.addEventListener('scroll', handleScroll);
});