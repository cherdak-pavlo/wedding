/* ============================================
   Wedding Site — Scripts
   ============================================ */

(function () {
    'use strict';

    // ── Helpers ──
    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ── Load invitation data ──
    // URL format:  site.com/#<id>  →  fetches guests/<id>.json
    //
    // guests/<id>.json shape:  { "t": "Дорогі ...!", "n": ["Ім'я1", "Ім'я2"] }
    // ("id" is inferred from the filename — no need to duplicate inside the file)
    //
    // To generate a new id:  crypto.randomUUID().replace(/-/g,'').slice(0,10)
    //
    // The actual fetch is kicked off in <head> of index.html (see window.__invitationPromise)
    // to minimise delay — here we just await whatever was started.
    function loadInvitation() {
        if (window.__invitationPromise) return window.__invitationPromise;
        return Promise.resolve(null);
    }

    // ── Countdown Timer ──
    var WEDDING_DATE = new Date('2026-05-30T12:30:00+03:00');

    function updateCountdown() {
        var now = new Date();
        var diff = WEDDING_DATE - now;

        if (diff <= 0) {
            document.getElementById('days').textContent = '0';
            document.getElementById('hours').textContent = '0';
            document.getElementById('minutes').textContent = '0';
            document.getElementById('seconds').textContent = '0';
            return;
        }

        var days = Math.floor(diff / (1000 * 60 * 60 * 24));
        var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = days;
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    // ── Calendar Widget (May 2026) ──
    function renderCalendar() {
        var container = document.getElementById('calendar-widget');
        if (!container) return;

        var year = 2026;
        var month = 4; // May (0-indexed)
        var weddingDay = 30;

        var monthNames = [
            'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
            'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
        ];
        var weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

        var header = document.createElement('div');
        header.className = 'calendar__header';
        header.textContent = monthNames[month] + ' ' + year;
        container.appendChild(header);

        var weekdaysRow = document.createElement('div');
        weekdaysRow.className = 'calendar__weekdays';
        weekdays.forEach(function (day) {
            var el = document.createElement('span');
            el.className = 'calendar__weekday';
            el.textContent = day;
            weekdaysRow.appendChild(el);
        });
        container.appendChild(weekdaysRow);

        var daysGrid = document.createElement('div');
        daysGrid.className = 'calendar__days';

        var firstDay = new Date(year, month, 1);
        var startDay = firstDay.getDay() - 1;
        if (startDay < 0) startDay = 6;

        var totalDays = new Date(year, month + 1, 0).getDate();

        for (var i = 0; i < startDay; i++) {
            var empty = document.createElement('span');
            empty.className = 'calendar__day calendar__day--empty';
            daysGrid.appendChild(empty);
        }

        for (var d = 1; d <= totalDays; d++) {
            var dayEl = document.createElement('span');
            dayEl.className = 'calendar__day';
            if (d === weddingDay) {
                dayEl.innerHTML = '<span class="calendar__day-num">' + d + '</span>';
                dayEl.classList.add('calendar__day--today');
                dayEl.insertAdjacentHTML('afterbegin',
                    '<span class="calendar__heart-wrap" aria-hidden="true">' +
                        '<span class="calendar__heart-shadow"></span>' +
                        '<svg class="calendar__heart" viewBox="0 0 60 60">' +
                            '<path d="M30 50 C8 34, 10 14, 22 14 C27 14, 30 18, 30 22 C30 18, 33 14, 38 14 C50 14, 52 34, 30 50 Z"/>' +
                        '</svg>' +
                    '</span>'
                );
            } else {
                dayEl.textContent = d;
            }
            daysGrid.appendChild(dayEl);
        }

        container.appendChild(daysGrid);
    }

    renderCalendar();

    // ── Scroll Reveal — sections ──
    function initReveal() {
        var sections = document.querySelectorAll(
            '.story, .calendar-section, .program, .dresscode, .rsvp'
        );
        sections.forEach(function (section) {
            section.classList.add('reveal');
        });

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal--visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        sections.forEach(function (section) {
            observer.observe(section);
        });
    }

    initReveal();

    // ── Scroll Reveal — individual elements ──
    function initElementReveal() {
        // Timeline items — alternate left / right
        document.querySelectorAll('.timeline__item').forEach(function (item, i) {
            item.classList.add('reveal-item', i % 2 === 0 ? 'reveal-from-right' : 'reveal-from-left');
            item.style.setProperty('--rd', (i * 0.1) + 's');
        });

        // Program cards — staggered bottom
        document.querySelectorAll('.program__card').forEach(function (card, i) {
            card.classList.add('reveal-item', 'reveal-from-bottom');
            card.style.setProperty('--rd', (i * 0.18) + 's');
        });

        // Dresscode circles — scale pop, staggered
        document.querySelectorAll('.dresscode__color').forEach(function (circle, i) {
            circle.classList.add('reveal-item', 'reveal-scale');
            circle.style.setProperty('--rd', (i * 0.07) + 's');
        });

        // Section titles
        document.querySelectorAll('.section-title').forEach(function (title) {
            title.classList.add('reveal-item', 'reveal-from-bottom');
        });

        // Story photo
        var storyPhoto = document.querySelector('.story__photo');
        if (storyPhoto) {
            storyPhoto.classList.add('reveal-item', 'reveal-scale-up');
        }

        // Calendar invite text + card
        var calInvite = document.querySelector('.calendar-section__invite');
        if (calInvite) {
            calInvite.classList.add('reveal-item', 'reveal-from-bottom');
            calInvite.style.setProperty('--rd', '0.1s');
        }
        var calCard = document.querySelector('.calendar-card');
        if (calCard) {
            calCard.classList.add('reveal-item', 'reveal-from-bottom');
            calCard.style.setProperty('--rd', '0.22s');
        }

        // RSVP subtitle
        var rsvpSub = document.querySelector('.rsvp__subtitle');
        if (rsvpSub) {
            rsvpSub.classList.add('reveal-item', 'reveal-from-bottom');
            rsvpSub.style.setProperty('--rd', '0.1s');
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var el = entry.target;
                    el.classList.add('reveal-item--visible');
                    observer.unobserve(el);
                    // Remove the stagger delay after the reveal animation finishes
                    // so it doesn't interfere with hover transitions
                    el.addEventListener('transitionend', function clearDelay() {
                        el.style.removeProperty('--rd');
                        el.removeEventListener('transitionend', clearDelay);
                    });
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

        document.querySelectorAll('.reveal-item').forEach(function (el) {
            observer.observe(el);
        });
    }

    initElementReveal();

    // ── Invitation-dependent init (hero greeting + RSVP) ──
    loadInvitation().then(function (invitation) {

    var heroGuest = document.getElementById('hero-guest');
    if (invitation && invitation.t && heroGuest) {
        heroGuest.textContent = invitation.t;
    }

    // ── RSVP ──
    var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAd_G5J7v5Rvf95XfBB_lOsGQXS0iqDel1k8VqwnY_gUJ6zOLq7gWKNlHI6OXvLe2R/exec';

    var form = document.getElementById('rsvp-form');
    var guestsList = document.getElementById('rsvp-guests-list');
    var successBlock = document.getElementById('rsvp-success');
    var summaryBlock = document.getElementById('rsvp-summary');
    var editBtn = document.getElementById('rsvp-edit-btn');
    var loadingBlock = document.getElementById('rsvp-loading');
    var overlay = document.getElementById('rsvp-overlay');

    var guestNames = (invitation && invitation.n) ? invitation.n : [];
    var invitationId = (invitation && invitation.id) ? invitation.id : null;

    // Anonymous visitors (no #id in URL) get a random id so their response is trackable
    if (!invitationId && form) {
        var storedAnonId = null;
        try { storedAnonId = localStorage.getItem('rsvp_anon_id'); } catch (e) {}
        if (!storedAnonId) {
            storedAnonId = 'anon_' + Math.random().toString(36).substring(2, 10);
            try { localStorage.setItem('rsvp_anon_id', storedAnonId); } catch (e) {}
        }
        invitationId = storedAnonId;
    }

    // Build guest cards dynamically
    function buildGuestCards() {
        if (!guestsList) return;
        guestsList.innerHTML = '';

        if (guestNames.length === 0) {
            var field = document.createElement('div');
            field.className = 'rsvp__field';
            field.innerHTML =
                '<div class="rsvp__guest-card">' +
                    '<input type="text" class="rsvp__guest-input" name="guest_name" placeholder="Підкажіть, як вас звати?" required style="border:none;font-family:var(--font-serif);font-size:1.3rem;font-weight:400;color:var(--color-dark);outline:none;width:100%;">' +
                '</div>' +
                '<div class="rsvp__guest-card" style="margin-top:8px">' +
                    '<span class="rsvp__label" style="margin:0">Чи будете присутні?</span>' +
                    '<div class="rsvp__toggle-group">' +
                        '<label class="rsvp__toggle"><input type="radio" name="guest_0" value="yes" checked><span class="rsvp__toggle-btn">Так</span></label>' +
                        '<label class="rsvp__toggle"><input type="radio" name="guest_0" value="no"><span class="rsvp__toggle-btn">Ні</span></label>' +
                    '</div>' +
                '</div>';
            guestsList.appendChild(field);
            return;
        }

        guestNames.forEach(function (name, i) {
            var card = document.createElement('div');
            card.className = 'rsvp__guest-card';
            card.innerHTML =
                '<span class="rsvp__guest-name">' + name + '</span>' +
                '<div class="rsvp__toggle-group">' +
                    '<label class="rsvp__toggle"><input type="radio" name="guest_' + i + '" value="yes" checked><span class="rsvp__toggle-btn">Так</span></label>' +
                    '<label class="rsvp__toggle"><input type="radio" name="guest_' + i + '" value="no"><span class="rsvp__toggle-btn">Ні</span></label>' +
                '</div>';
            guestsList.appendChild(card);
        });
    }

    buildGuestCards();

    // Collect form data
    function collectFormData() {
        var guests = [];
        guestNames.forEach(function (name, i) {
            var checked = form.querySelector('input[name="guest_' + i + '"]:checked');
            guests.push({
                name: name,
                attending: checked ? checked.value : 'yes'
            });
        });

        if (guestNames.length === 0) {
            var nameInput = form.querySelector('input[name="guest_name"]');
            var checked = form.querySelector('input[name="guest_0"]:checked');
            guests.push({
                name: nameInput ? nameInput.value : '',
                attending: checked ? checked.value : 'yes'
            });
        }

        var transferChecked = form.querySelector('input[name="transfer"]:checked');
        var wishes = document.getElementById('rsvp-wishes');

        return {
            id: invitationId,
            guests: guests,
            transfer: transferChecked ? transferChecked.value : 'no',
            wishes: wishes ? wishes.value : ''
        };
    }

    // Last known response data (to restore form without re-fetching)
    var lastResponseData = null;

    // State management
    function showState(state) {
        if (loadingBlock) loadingBlock.hidden = state !== 'loading';
        if (form) form.hidden = state !== 'form';
        if (overlay) overlay.hidden = state !== 'submitting';
        if (successBlock) successBlock.hidden = state !== 'success';

        // When submitting — show form underneath the overlay
        if (state === 'submitting' && form) {
            form.hidden = false;
        }
    }

    function renderSummary(data) {
        if (!summaryBlock) return;

        var html = '';
        data.guests.forEach(function (g) {
            var name = escapeHtml(g.name || 'Гість');
            var attending = g.attending === 'yes' ? 'yes' : 'no';
            html += '<div class="rsvp__summary-row">' +
                '<span class="rsvp__summary-label">' + name + '</span>' +
                '<span class="rsvp__summary-value rsvp__summary-value--' + attending + '">' +
                    (attending === 'yes' ? 'Буде з нами' : 'Не зможе бути') +
                '</span>' +
                '</div>';
        });
        html += '<div class="rsvp__summary-row">' +
            '<span class="rsvp__summary-label">Трансфер</span>' +
            '<span class="rsvp__summary-value">' + (data.transfer === 'yes' ? 'Потрібен' : 'Не потрібен') + '</span>' +
            '</div>';
        if (data.wishes) {
            html += '<div class="rsvp__summary-row">' +
                '<span class="rsvp__summary-label">Побажання</span>' +
                '<span class="rsvp__summary-value">' + escapeHtml(data.wishes) + '</span>' +
                '</div>';
        }
        summaryBlock.innerHTML = html;
    }

    // Restore form values from saved data
    function restoreForm(data) {
        data.guests.forEach(function (g, i) {
            var nameInput = form.querySelector('input[name="guest_name"]');
            if (nameInput && g.name) nameInput.value = g.name;
            var radio = form.querySelector('input[name="guest_' + i + '"][value="' + g.attending + '"]');
            if (radio) radio.checked = true;
        });
        var transferRadio = form.querySelector('input[name="transfer"][value="' + data.transfer + '"]');
        if (transferRadio) transferRadio.checked = true;
        var wishes = document.getElementById('rsvp-wishes');
        if (wishes && data.wishes) wishes.value = data.wishes;
    }

    // Fetch saved response from Google Sheets on page load
    function fetchSavedResponse() {
        // Check server for anyone who has an id (personalized or anonymous)
        if (!APPS_SCRIPT_URL || !invitationId) {
            showState('form');
            return;
        }

        showState('loading');

        fetch(APPS_SCRIPT_URL + '?id=' + encodeURIComponent(invitationId))
            .then(function (res) { return res.json(); })
            .then(function (data) {
                if (data.submitted) {
                    lastResponseData = data;
                    renderSummary(data);
                    showState('success');
                } else {
                    showState('form');
                }
            })
            .catch(function () {
                showState('form');
            });
    }

    fetchSavedResponse();

    // Submit to Google Sheets
    function submitToSheets(data) {
        if (!APPS_SCRIPT_URL) {
            console.log('RSVP Data (no Apps Script URL configured):', data);
            renderSummary(data);
            showState('success');
            return;
        }

        showState('submitting');

        fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(data)
        })
        .then(function (res) { return res.json(); })
        .then(function (result) {
            if (result.success) {
                lastResponseData = data;
                renderSummary(data);
                showState('success');
            } else {
                showState('form');
                alert('Сталася помилка. Спробуйте ще раз.');
            }
        })
        .catch(function () {
            showState('form');
            alert('Немає з\'єднання з сервером. Перевірте інтернет і спробуйте ще раз.');
        });
    }

    // Submit handler
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            submitToSheets(collectFormData());
        });
    }

    // Edit button — go back to form with already loaded values
    if (editBtn) {
        editBtn.addEventListener('click', function () {
            if (lastResponseData) {
                restoreForm(lastResponseData);
            }
            showState('form');
        });
    }

    });

})();
