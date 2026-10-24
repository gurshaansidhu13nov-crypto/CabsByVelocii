/* ==========================================================================
   CabsByVelociti — Main Interactive Logic
   Handles:
   1. Part 1 vs Part 2 Division Switcher
   2. Cab & Chauffeur (Live) vs Full Tour Package (On Hold) Mode Switcher
   3. Destination Carousel with Hero Thumbnail sync
   4. Fleet Category Filtering
   5. Card Accordions (Itinerary, Inclusions, Exclusions, T&C)
   6. Testimonials Carousel
   7. Live Stats Counter Animation
   8. Enquiry Modal & Automated WhatsApp (+91 9818091778) + Email Dispatch
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ---------- 1. Preloader ----------
  const preloader = document.getElementById('preloader');
  const hidePreloader = () => {
    if (preloader && !preloader.classList.contains('hidden')) {
      preloader.classList.add('hidden');
    }
  };
  window.addEventListener('load', () => setTimeout(hidePreloader, 400));
  setTimeout(hidePreloader, 2500); // Safety fallback

  // ---------- 2. Header Scroll Effect & Back-to-Top ----------
  const header = document.querySelector('.header');
  const scrollTopBtn = document.getElementById('scrollTopBtn');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    header?.classList.toggle('scrolled', scrollY > 30);
    scrollTopBtn?.classList.toggle('visible', scrollY > 400);
  });

  scrollTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ---------- 3. Mobile Navigation Drawer ----------
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');

  const toggleMobileNav = () => {
    hamburger?.classList.toggle('active');
    mobileMenu?.classList.toggle('active');
    document.body.style.overflow = mobileMenu?.classList.contains('active') ? 'hidden' : '';
  };

  hamburger?.addEventListener('click', toggleMobileNav);

  document.querySelectorAll('.mobile-menu a, .mobile-menu button').forEach(el => {
    el.addEventListener('click', () => {
      hamburger?.classList.remove('active');
      mobileMenu?.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // ---------- 4. Division Switcher (Part 1 vs Part 2) ----------
  const divisionBtns = document.querySelectorAll('.division-btn');
  const part1Wrapper = document.getElementById('part1-wrapper');
  const part2Wrapper = document.getElementById('part2-wrapper');

  window.switchDivision = (divisionKey) => {
    divisionBtns.forEach(btn => {
      if (btn.dataset.division === divisionKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (divisionKey === 'part1') {
      part1Wrapper?.classList.add('active');
      part2Wrapper?.classList.remove('active');
    } else {
      part2Wrapper?.classList.add('active');
      part1Wrapper?.classList.remove('active');
    }

    const divisionBar = document.getElementById('division-bar');
    if (divisionBar) {
      const topOffset = divisionBar.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  };

  divisionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const divKey = btn.dataset.division;
      if (divKey) window.switchDivision(divKey);
    });
  });

  // ---------- 5. Unified Package Customizer & Card Add-ons Sync ----------
  const hubAddonToggles = document.querySelectorAll('.hub-addon-toggle');
  const modalIncludeHotel = document.getElementById('modalIncludeHotel');
  const modalIncludeMeals = document.getElementById('modalIncludeMeals');
  const modalIncludeGuide = document.getElementById('modalIncludeGuide');

  // When user toggles top customizer bar checkboxes
  hubAddonToggles.forEach(toggle => {
    toggle.addEventListener('change', () => {
      const addon = toggle.dataset.addon;
      const isChecked = toggle.checked;

      // Update parent check item visual
      toggle.closest('.customizer-check-item')?.classList.toggle('selected', isChecked);

      // Sync to all card-level checkboxes
      document.querySelectorAll(`.card-addon-checkbox[data-addon="${addon}"]`).forEach(cb => {
        cb.checked = isChecked;
      });

      // Sync to modal checkboxes
      if (addon === 'hotel' && modalIncludeHotel) modalIncludeHotel.checked = isChecked;
      if (addon === 'meals' && modalIncludeMeals) modalIncludeMeals.checked = isChecked;
      if (addon === 'guide' && modalIncludeGuide) modalIncludeGuide.checked = isChecked;
    });
  });

  // When card checkboxes change individually
  document.querySelectorAll('.card-addon-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      const addon = cb.dataset.addon;
      if (cb.checked) {
        if (addon === 'hotel' && modalIncludeHotel) modalIncludeHotel.checked = true;
        if (addon === 'meals' && modalIncludeMeals) modalIncludeMeals.checked = true;
        if (addon === 'guide' && modalIncludeGuide) modalIncludeGuide.checked = true;
      }
    });
  });

  // ---------- 6. Destination Carousel & Hero Thumbnails Sync ----------
  const destTrack = document.getElementById('destTrack');
  const destSlides = document.querySelectorAll('.dest-slide-card');
  const carouselPrev = document.getElementById('carouselPrev');
  const carouselNext = document.getElementById('carouselNext');
  const carouselDots = document.querySelectorAll('#carouselDots .indicator-dot');
  const previewThumbs = document.querySelectorAll('.preview-thumb');

  let currentSlideIndex = 0;
  const totalSlides = destSlides.length;
  let carouselTimer = null;

  function updateSlide(index) {
    if (totalSlides === 0) return;
    currentSlideIndex = ((index % totalSlides) + totalSlides) % totalSlides;

    if (destTrack) {
      destTrack.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
    }

    carouselDots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentSlideIndex);
    });

    previewThumbs.forEach((thumb, idx) => {
      thumb.classList.toggle('active', idx === currentSlideIndex);
    });
  }

  // Map slide index to designated state topic sections
  const topicMap = {
    0: 'state-delhi',
    1: 'state-rajasthan',
    2: 'state-agra',
    3: 'state-himachal',
    4: 'state-uttarakhand'
  };

  // Jump to designated topic and sync carousel
  window.jumpToTopic = (topicIdOrIndex, slideIndex) => {
    let targetId = topicIdOrIndex;
    let sIdx = slideIndex;

    if (typeof topicIdOrIndex === 'number') {
      sIdx = topicIdOrIndex;
      targetId = topicMap[sIdx] || 'state-delhi';
    } else if (typeof sIdx === 'undefined') {
      for (const [key, val] of Object.entries(topicMap)) {
        if (val === targetId) {
          sIdx = parseInt(key, 10);
          break;
        }
      }
    }

    if (sIdx !== undefined) {
      updateSlide(sIdx);
      resetCarouselTimer();
    }

    // Switch to Part 1 if user is currently on Part 2
    if (typeof switchDivision === 'function') {
      switchDivision('part1');
    }

    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      const headerOffset = 90;
      const elementPosition = targetEl.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // Visual focus animation on the designated topic
      targetEl.classList.add('topic-focused');
      setTimeout(() => {
        targetEl.classList.remove('topic-focused');
      }, 2500);
    }
  };

  window.jumpToSlide = (index) => {
    window.jumpToTopic(index, index);
  };

  function startCarouselTimer() {
    carouselTimer = setInterval(() => {
      updateSlide(currentSlideIndex + 1);
    }, 6000);
  }

  function resetCarouselTimer() {
    if (carouselTimer) clearInterval(carouselTimer);
    startCarouselTimer();
  }

  carouselPrev?.addEventListener('click', () => {
    updateSlide(currentSlideIndex - 1);
    resetCarouselTimer();
  });

  carouselNext?.addEventListener('click', () => {
    updateSlide(currentSlideIndex + 1);
    resetCarouselTimer();
  });

  carouselDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.index, 10);
      if (!isNaN(idx)) {
        updateSlide(idx);
        resetCarouselTimer();
      }
    });
  });

  if (totalSlides > 0) {
    startCarouselTimer();
  }

  // ---------- 7. Fleet Category Filter ----------
  const fleetFilterBtns = document.querySelectorAll('.fleet-filter-btn');
  const fleetCards = document.querySelectorAll('.fleet-unit-card');

  fleetFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      fleetFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const selectedCat = btn.dataset.fleetCat;

      fleetCards.forEach(card => {
        const cardCat = card.dataset.fleetCategory;
        if (selectedCat === 'all' || cardCat === selectedCat) {
          card.style.display = 'block';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 20);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 250);
        }
      });
    });
  });

  // ---------- 8. Card Accordions (Itinerary, Inclusions, Exclusions, T&C) ----------
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const parentCard = trigger.closest('.card-accordion');
      const pane = trigger.nextElementSibling;
      const isOpen = trigger.classList.contains('active');

      // Close siblings in the same card
      parentCard?.querySelectorAll('.accordion-trigger').forEach(t => t.classList.remove('active'));
      parentCard?.querySelectorAll('.accordion-pane').forEach(p => p.classList.remove('active'));

      if (!isOpen) {
        trigger.classList.add('active');
        pane?.classList.add('active');
      }
    });
  });

  // ---------- 9. Testimonials Carousel ----------
  const testCards = document.querySelectorAll('.testimonial-single-card');
  const testDots = document.querySelectorAll('#testDots .indicator-dot');
  let currentTestIndex = 0;
  let testTimer = null;

  function showTestimonial(idx) {
    if (testCards.length === 0) return;
    currentTestIndex = ((idx % testCards.length) + testCards.length) % testCards.length;

    testCards.forEach((card, i) => {
      card.classList.toggle('active', i === currentTestIndex);
    });

    testDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentTestIndex);
    });
  }

  testDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.tIndex, 10);
      if (!isNaN(idx)) {
        showTestimonial(idx);
        if (testTimer) clearInterval(testTimer);
        startTestTimer();
      }
    });
  });

  function startTestTimer() {
    testTimer = setInterval(() => {
      showTestimonial(currentTestIndex + 1);
    }, 7000);
  }

  if (testCards.length > 0) {
    startTestTimer();
  }

  // ---------- 10. Live Stats Counter Animation ----------
  const countElements = document.querySelectorAll('[data-count]');
  let counted = false;

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !counted) {
        counted = true;
        countElements.forEach(el => {
          const target = parseInt(el.dataset.count, 10);
          const suffix = el.dataset.suffix || '';
          let current = 0;
          const step = Math.max(1, Math.floor(target / 50));
          const interval = setInterval(() => {
            current += step;
            if (current >= target) {
              current = target;
              clearInterval(interval);
            }
            el.textContent = current.toLocaleString('en-IN') + suffix;
          }, 30);
        });
        countObserver.disconnect();
      }
    });
  }, { threshold: 0.3 });

  const statsStrip = document.querySelector('.stats-strip');
  if (statsStrip) countObserver.observe(statsStrip);

  // ---------- 11. Interactive Enquiry Modal ----------
  const modalBackdrop = document.getElementById('enquiryModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalServiceTitle = document.getElementById('modalServiceTitle');
  const hiddenServiceName = document.getElementById('hiddenServiceName');
  const formTripField = document.getElementById('formTripField');
  const formCarField = document.getElementById('formCarField');
  const formDateField = document.getElementById('formDateField');
  const formTimeField = document.getElementById('formTimeField');
  const formDaysField = document.getElementById('formDaysField');
  const isAirportTransferCheck = document.getElementById('isAirportTransferCheck');
  const airportFieldsContainer = document.getElementById('airportFieldsContainer');
  const formTransferType = document.getElementById('formTransferType');
  const formFlightNumber = document.getElementById('formFlightNumber');
  const formFlightTime = document.getElementById('formFlightTime');
  const formSubjectField = document.getElementById('formSubjectField');
  const cabEnquiryForm = document.getElementById('cabEnquiryForm');

  // Enterprise / B2B Section Elements
  const enterpriseSection = document.getElementById('enterpriseSection');
  const corporateFieldsBlock = document.getElementById('corporateFieldsBlock');
  const weddingFieldsBlock = document.getElementById('weddingFieldsBlock');
  const eventFieldsBlock = document.getElementById('eventFieldsBlock');
  const part1RideFieldsBlock = document.getElementById('part1RideFieldsBlock');
  const standardContactBlock = document.getElementById('standardContactBlock');

  // Privacy Modal Elements
  const privacyPolicyModal = document.getElementById('privacyPolicyModal');
  const privacyModalCloseBtn = document.getElementById('privacyModalCloseBtn');

  window.openPrivacyModal = () => {
    privacyPolicyModal?.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closePrivacyModal = () => {
    privacyPolicyModal?.classList.remove('active');
    if (!modalBackdrop?.classList.contains('active') && !termsPolicyModal?.classList.contains('active')) {
      document.body.style.overflow = '';
    }
  };

  privacyModalCloseBtn?.addEventListener('click', window.closePrivacyModal);
  privacyPolicyModal?.addEventListener('click', (e) => {
    if (e.target === privacyPolicyModal) window.closePrivacyModal();
  });

  // Terms & Conditions Modal Elements
  const termsPolicyModal = document.getElementById('termsPolicyModal');
  const termsModalCloseBtn = document.getElementById('termsModalCloseBtn');

  window.openTermsModal = () => {
    termsPolicyModal?.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeTermsModal = () => {
    termsPolicyModal?.classList.remove('active');
    if (!modalBackdrop?.classList.contains('active') && !privacyPolicyModal?.classList.contains('active')) {
      document.body.style.overflow = '';
    }
  };

  termsModalCloseBtn?.addEventListener('click', window.closeTermsModal);
  termsPolicyModal?.addEventListener('click', (e) => {
    if (e.target === termsPolicyModal) window.closeTermsModal();
  });

  // Airport transfer checkbox listener
  isAirportTransferCheck?.addEventListener('change', () => {
    if (airportFieldsContainer) {
      airportFieldsContainer.classList.toggle('active', isAirportTransferCheck.checked);
    }
  });

  function openEnquiryModal(serviceName, customPickup, customDrop) {
    const cleanServiceName = serviceName || 'General Cab Enquiry';
    if (modalServiceTitle) modalServiceTitle.textContent = `Trip name: * ${cleanServiceName}`;
    if (hiddenServiceName) hiddenServiceName.value = cleanServiceName;
    if (formTripField) formTripField.value = cleanServiceName;

    if (formSubjectField) {
      formSubjectField.value = `Enquiry for ${cleanServiceName}`;
    }

    // Auto-fill Pickup & Drop Locations
    const formPickupLocation = document.getElementById('formPickupLocation');
    const formDropLocation = document.getElementById('formDropLocation');

    if (formPickupLocation) {
      if (customPickup) {
        formPickupLocation.value = customPickup;
      } else {
        const lower = cleanServiceName.toLowerCase();
        if (lower.includes('roadshow') || lower.includes('delegation')) {
          formPickupLocation.value = 'Delhi NCR Hotel / Aerocity / IGI Airport T3';
        } else if (lower.includes('golden triangle')) {
          formPickupLocation.value = 'Delhi NCR (Doorstep Hotel / Airport)';
        } else if (lower.includes('embassy') || lower.includes('leasing') || lower.includes('expat')) {
          formPickupLocation.value = 'Embassy / Diplomatic Mission / Expat Residence';
        } else if (lower.includes('airport')) {
          formPickupLocation.value = 'IGI Airport Terminal / Delhi NCR Hotel';
        } else if (lower.includes('delhi')) {
          formPickupLocation.value = 'Delhi NCR (Doorstep Hotel / Home)';
        } else if (lower.includes('jaipur')) {
          formPickupLocation.value = 'Delhi NCR (Hotel / Home)';
        } else if (lower.includes('agra')) {
          formPickupLocation.value = 'Delhi NCR (Hotel / Home)';
        } else if (lower.includes('shimla') || lower.includes('himachal')) {
          formPickupLocation.value = 'Delhi NCR / Airport';
        } else if (lower.includes('corbett') || lower.includes('nainital')) {
          formPickupLocation.value = 'Delhi NCR';
        } else if (!formPickupLocation.value) {
          formPickupLocation.value = 'Delhi NCR';
        }
      }
    }

    if (formDropLocation) {
      if (customDrop) {
        formDropLocation.value = customDrop;
      } else {
        const lower = cleanServiceName.toLowerCase();
        if (lower.includes('roadshow') || lower.includes('delegation')) {
          formDropLocation.value = 'Gurgaon CyberCity, Noida, Aerocity & Standby Meetings';
        } else if (lower.includes('golden triangle')) {
          formDropLocation.value = 'Agra, Jaipur & Fatehpur Sikri (Zero Surprise Charges Circuit)';
        } else if (lower.includes('embassy') || lower.includes('leasing') || lower.includes('expat')) {
          formDropLocation.value = 'Dedicated Long-Term Chauffeur Leasing Pan-India';
        } else if (lower.includes('airport')) {
          formDropLocation.value = 'Delhi NCR Hotel / IGI Airport Terminal';
        } else if (lower.includes('delhi full day') || lower.includes('old delhi')) {
          formDropLocation.value = 'Delhi Heritage Monuments / Hotel Drop';
        } else if (lower.includes('jaipur')) {
          formDropLocation.value = 'Jaipur Forts & Palaces (Return)';
        } else if (lower.includes('agra mathura')) {
          formDropLocation.value = 'Agra, Mathura & Vrindavan';
        } else if (lower.includes('agra')) {
          formDropLocation.value = 'Agra (Taj Mahal & Agra Fort)';
        } else if (lower.includes('shimla') || lower.includes('himachal')) {
          formDropLocation.value = 'Shimla, Manali & Hill Stations';
        } else if (lower.includes('corbett') || lower.includes('nainital')) {
          formDropLocation.value = 'Jim Corbett & Nainital';
        } else if (lower.includes('haridwar') || lower.includes('rishikesh')) {
          formDropLocation.value = 'Haridwar & Rishikesh';
        } else if (!formDropLocation.value) {
          formDropLocation.value = 'Outstation / Local Destination';
        }
      }
    }

    // Set default travel date (tomorrow)
    if (formDateField && !formDateField.value) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      formDateField.value = tomorrow.toISOString().split('T')[0];
    }

    // Set default pickup time
    if (formTimeField && !formTimeField.value) {
      formTimeField.value = '09:00';
    }

    // Auto-detect specific vehicle if user clicked a car card or international service
    if (formCarField) {
      const lowerService = cleanServiceName.toLowerCase();
      if (lowerService.includes('roadshow') || lowerService.includes('delegation')) {
        formCarField.value = 'Mercedes-Benz E220d';
      } else if (lowerService.includes('golden triangle')) {
        formCarField.value = 'Innova Hycross';
      } else if (lowerService.includes('embassy') || lowerService.includes('leasing')) {
        formCarField.value = 'Toyota Vellfire';
      } else if (lowerService.includes('dzire')) {
        formCarField.value = 'Swift Dzire';
      } else if (lowerService.includes('honda city')) {
        formCarField.value = 'Honda City';
      } else if (lowerService.includes('carens')) {
        formCarField.value = 'Kia Carens';
      } else if (lowerService.includes('crysta')) {
        formCarField.value = 'Innova Crysta';
      } else if (lowerService.includes('hycross')) {
        formCarField.value = 'Innova Hycross';
      } else if (lowerService.includes('urbania')) {
        formCarField.value = 'Urbania 12 Seater with Recliners';
      } else if (lowerService.includes('22 seater')) {
        formCarField.value = '22 Seater Luxury Bus';
      } else if (lowerService.includes('mercedes') || lowerService.includes('e220d')) {
        formCarField.value = 'Mercedes-Benz E220d';
      } else if (lowerService.includes('vellfire')) {
        formCarField.value = 'Toyota Vellfire';
      } else if (lowerService.includes('fortuner')) {
        formCarField.value = 'Toyota Fortuner';
      } else if (!formCarField.value) {
        formCarField.value = 'Innova Crysta';
      }
    }

    // Auto-detect default days & Airport Transfer mode
    const isAirport = cleanServiceName.toLowerCase().includes('airport');
    if (isAirportTransferCheck) {
      isAirportTransferCheck.checked = isAirport;
      airportFieldsContainer?.classList.toggle('active', isAirport);
    }

    // Auto-detect B2B Enterprise portions (1-Corporate Contracts, 2-Weddings & Family Events, 3-Corporate Events)
    const lower = cleanServiceName.toLowerCase();
    const isCorporateContracts = (lower.includes('corporate contract') || lower.includes('employee transport') || lower.includes('corporate quotation') || lower.includes('corporate contract or event rfp')) && !lower.includes('corporate event');
    const isWedding = lower.includes('wedding') || lower.includes('family event');
    const isCorporateEvents = lower.includes('corporate event') || lower.includes('conference');
    const isEnterprise = isCorporateContracts || isWedding || isCorporateEvents;

    if (isEnterprise) {
      if (enterpriseSection) enterpriseSection.style.display = 'block';
      if (part1RideFieldsBlock) part1RideFieldsBlock.style.display = 'none';
      if (standardContactBlock) standardContactBlock.style.display = 'none';

      if (corporateFieldsBlock) corporateFieldsBlock.style.display = isCorporateContracts ? 'block' : 'none';
      if (weddingFieldsBlock) weddingFieldsBlock.style.display = isWedding ? 'block' : 'none';
      if (eventFieldsBlock) eventFieldsBlock.style.display = isCorporateEvents ? 'block' : 'none';

      if (isCorporateContracts) {
        if (modalServiceTitle) modalServiceTitle.textContent = 'Enquiry: Corporate Contracts & Employee Transport';
        if (formTripField) formTripField.value = 'Corporate Contracts & Employee Transport';
        if (formSubjectField) formSubjectField.value = 'Corporate Contracts Enquiry - ' + (document.getElementById('corpCompanyName')?.value || 'RFP');
      } else if (isWedding) {
        if (modalServiceTitle) modalServiceTitle.textContent = 'Enquiry: Weddings & Family Events Mobility';
        if (formTripField) formTripField.value = 'Weddings & Family Events';
        if (formSubjectField) formSubjectField.value = 'Wedding & Family Events Enquiry';
      } else if (isCorporateEvents) {
        if (modalServiceTitle) modalServiceTitle.textContent = 'Enquiry: Corporate Events & Conferences Logistics';
        if (formTripField) formTripField.value = 'Corporate Events';
        if (formSubjectField) formSubjectField.value = 'Corporate Events Enquiry';
      }
    } else {
      if (enterpriseSection) enterpriseSection.style.display = 'none';
      if (corporateFieldsBlock) corporateFieldsBlock.style.display = 'none';
      if (weddingFieldsBlock) weddingFieldsBlock.style.display = 'none';
      if (eventFieldsBlock) eventFieldsBlock.style.display = 'none';
      if (part1RideFieldsBlock) part1RideFieldsBlock.style.display = 'block';
      if (standardContactBlock) standardContactBlock.style.display = 'block';

      if (modalServiceTitle) modalServiceTitle.textContent = `Trip name: * ${cleanServiceName}`;
      if (formTripField) formTripField.value = cleanServiceName;
      if (formSubjectField) formSubjectField.value = `Enquiry for ${cleanServiceName}`;
    }

    if (formDaysField) {
      if (cleanServiceName.toLowerCase().includes('roadshow')) {
        formDaysField.value = 'Full Day Standby';
      } else if (cleanServiceName.toLowerCase().includes('leasing')) {
        formDaysField.value = '1 Year Annual Lease';
      } else if (cleanServiceName.toLowerCase().includes('golden triangle')) {
        formDaysField.value = '5 Days';
      } else if (cleanServiceName.toLowerCase().includes('same day')) {
        formDaysField.value = 'Same Day';
      } else if (cleanServiceName.toLowerCase().includes('overnight')) {
        formDaysField.value = '2 Days / 1 Night';
      } else if (isAirport) {
        formDaysField.value = 'Same Day (Airport Transfer)';
      } else if (cleanServiceName.toLowerCase().includes('shimla manali')) {
        formDaysField.value = '6 Days';
      } else if (cleanServiceName.toLowerCase().includes('complete himachal')) {
        formDaysField.value = '9 Days';
      } else {
        formDaysField.value = '3 Days';
      }
    }

    modalBackdrop?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeEnquiryModal() {
    modalBackdrop?.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Open modal on any [data-enquire] button click
  document.querySelectorAll('[data-enquire]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const service = btn.getAttribute('data-enquire');

      // Check card-level add-ons
      const card = btn.closest('.travel-card');
      if (card) {
        const hotelCb = card.querySelector('.card-addon-checkbox[data-addon="hotel"]');
        const mealsCb = card.querySelector('.card-addon-checkbox[data-addon="meals"]');
        const guideCb = card.querySelector('.card-addon-checkbox[data-addon="guide"]');

        if (modalIncludeHotel) {
          modalIncludeHotel.checked = hotelCb?.checked || document.getElementById('hubIncludeHotel')?.checked || false;
        }
        if (modalIncludeMeals) {
          modalIncludeMeals.checked = mealsCb?.checked || document.getElementById('hubIncludeMeals')?.checked || false;
        }
        if (modalIncludeGuide) {
          modalIncludeGuide.checked = guideCb?.checked || document.getElementById('hubIncludeGuide')?.checked || false;
        }
      } else {
        if (modalIncludeHotel) modalIncludeHotel.checked = document.getElementById('hubIncludeHotel')?.checked || false;
        if (modalIncludeMeals) modalIncludeMeals.checked = document.getElementById('hubIncludeMeals')?.checked || false;
        if (modalIncludeGuide) modalIncludeGuide.checked = document.getElementById('hubIncludeGuide')?.checked || false;
      }

      openEnquiryModal(service);
    });
  });

  modalCloseBtn?.addEventListener('click', closeEnquiryModal);

  modalBackdrop?.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeEnquiryModal();
  });

  // Helper to sync wedding vehicles quantity and total
  function recalcWeddingVehicles() {
    const configs = [
      { check: 'wedVehLuxurySedan', qty: 'wedQtyLuxurySedan', box: 'wedBoxLuxurySedan' },
      { check: 'wedVehSUV', qty: 'wedQtySUV', box: 'wedBoxSUV' },
      { check: 'wedVehVintage', qty: 'wedQtyVintage', box: 'wedBoxVintage' },
      { check: 'wedVehTempo', qty: 'wedQtyTempo', box: 'wedBoxTempo' },
      { check: 'wedVehBus', qty: 'wedQtyBus', box: 'wedBoxBus' },
      { check: 'wedVehMixed', qty: 'wedQtyMixed', box: 'wedBoxMixed' }
    ];

    let total = 0;
    configs.forEach(item => {
      const cb = document.getElementById(item.check);
      const qtyInput = document.getElementById(item.qty);
      const box = document.getElementById(item.box);

      if (cb && qtyInput && box) {
        if (cb.checked) {
          box.classList.add('active');
          qtyInput.disabled = false;
          const val = parseInt(qtyInput.value) || 1;
          total += val;
        } else {
          box.classList.remove('active');
          qtyInput.disabled = true;
        }
      }
    });

    const totalInput = document.getElementById('wedTotalVehicles');
    if (totalInput) {
      totalInput.value = total > 0 ? total : 1;
    }
  }

  // Attach event listeners for real-time recalculation of wedding fleet
  [
    'wedVehLuxurySedan', 'wedVehSUV', 'wedVehVintage', 'wedVehTempo', 'wedVehBus', 'wedVehMixed',
    'wedQtyLuxurySedan', 'wedQtySUV', 'wedQtyVintage', 'wedQtyTempo', 'wedQtyBus', 'wedQtyMixed'
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', recalcWeddingVehicles);
      el.addEventListener('input', recalcWeddingVehicles);
    }
  });

  // ---------- 12. Automated WhatsApp & Email Dispatch Form ----------
  cabEnquiryForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const isEnterprise = enterpriseSection && enterpriseSection.style.display !== 'none';
    const isCorpActive = isEnterprise && corporateFieldsBlock && corporateFieldsBlock.style.display !== 'none';
    const isWedActive = isEnterprise && weddingFieldsBlock && weddingFieldsBlock.style.display !== 'none';
    const isEvtActive = isEnterprise && eventFieldsBlock && eventFieldsBlock.style.display !== 'none';

    // =========================================================================
    // 1. CORPORATE CONTRACTS & EMPLOYEE TRANSPORT SUBMISSION
    // =========================================================================
    if (isCorpActive) {
      const corpCompany = document.getElementById('corpCompanyName')?.value.trim() || '';
      const corpPerson = document.getElementById('corpContactPerson')?.value.trim() || '';
      const corpDesig = document.getElementById('corpDesignation')?.value.trim() || '';
      const corpEmail = document.getElementById('corpWorkEmail')?.value.trim() || '';
      const corpPhone = document.getElementById('corpPhone')?.value.trim() || '';
      const corpCity = document.getElementById('corpCityLocation')?.value.trim() || '';
      const corpService = document.getElementById('corpServiceNeeded')?.value || '';
      const corpFleet = document.getElementById('corpFleetCount')?.value.trim() || 'As per requirement';
      const corpNotes = document.getElementById('corpNotes')?.value.trim() || 'None provided';

      if (!corpCompany || !corpPerson || !corpDesig || !corpEmail || !corpPhone || !corpCity || !corpService) {
        alert('Please fill in all required Corporate Contract details:\n• Company Name\n• Contact Person & Designation\n• Work Email & Phone/WhatsApp\n• City/Office Location\n• Service Needed');
        return;
      }

      const waText = 
`🏢 *1. CORPORATE CONTRACTS ENQUIRY — CabsByVelociti*
*Enterprise Mobility Simplified | Pan India*
━━━━━━━━━━━━━━━━━━━━
🏢 *Company Name:* ${corpCompany}
👤 *Contact Person:* ${corpPerson}
💼 *Designation:* ${corpDesig}
📧 *Work Email:* ${corpEmail}
📱 *Phone / WhatsApp:* ${corpPhone}
📍 *City / Office Location:* ${corpCity}
📋 *Service Needed:* ${corpService}
🚗 *Number of Vehicles Required:* ${corpFleet}
📝 *Additional Fleet / Route Notes:*
"${corpNotes}"
━━━━━━━━━━━━━━━━━━━━
🌙 *Terms:* Night duty applicable only after 10:00 PM to 06:00 AM
📞 Direct Corporate Desk: +91 98180 91778
✉️ jaswinder@velociticabs.com
🌐 CabsByVelociti`;

      const mailSubject = encodeURIComponent(`[Corporate Contract RFP] ${corpCompany} - ${corpPerson} (${corpDesig})`);
      const mailBody = encodeURIComponent(
`1. CORPORATE CONTRACTS ENQUIRY — CabsByVelociti

CONTACT DETAILS (REQUIRED):
Company Name: ${corpCompany}
Contact Person's Name: ${corpPerson}
Designation: ${corpDesig}
Work Email: ${corpEmail}
Phone / WhatsApp: ${corpPhone}
City / Office Location: ${corpCity}

SERVICE NEEDED:
${corpService}

NUMBER OF VEHICLES REQUIRED (FLEET ESTIMATE):
${corpFleet}

ADDITIONAL FLEET / ROUTE NOTES:
${corpNotes}

TERMS:
Night duty is applicable only after 10:00 PM to 06:00 AM.

--
Main Head Office: Near Plot No. A-7, Satsang Vihar Marg, Qutab Institutional Area, New Delhi - 110067
Email: jaswinder@velociticabs.com | Phone: +91 98180 91778`
      );

      window.open(`https://wa.me/919818091778?text=${encodeURIComponent(waText)}`, '_blank');
      setTimeout(() => {
        window.location.href = `mailto:jaswinder@velociticabs.com?subject=${mailSubject}&body=${mailBody}`;
      }, 900);

      closeEnquiryModal();
      showToastNotification('✅ Corporate Contracts enquiry submitted! Opening WhatsApp & Email.');
      cabEnquiryForm.reset();
      return;
    }

    // =========================================================================
    // 2. WEDDING AND FAMILY EVENTS SUBMISSION
    // =========================================================================
    if (isWedActive) {
      const wedName = document.getElementById('wedName')?.value.trim() || '';
      const wedPhone = document.getElementById('wedPhone')?.value.trim() || '';
      const wedEmail = document.getElementById('wedEmail')?.value.trim() || '';
      const wedType = document.getElementById('wedEventType')?.value || 'Wedding';
      const wedDates = document.getElementById('wedEventDates')?.value.trim() || '';
      const wedCity = document.getElementById('wedEventCity')?.value.trim() || '';
      const wedVenues = document.getElementById('wedVenueNames')?.value.trim() || 'Not specified';
      const wedGuests = document.getElementById('wedGuestCount')?.value.trim() || '';
      const wedTotalVehicles = document.getElementById('wedTotalVehicles')?.value.trim() || '5';
      const wedBudget = document.getElementById('wedBudget')?.value || 'Not sure yet';
      const wedNotes = document.getElementById('wedNotes')?.value.trim() || 'None provided';

      const wedVehicles = [];
      const wedBreakdown = [];
      const configs = [
        { check: 'wedVehLuxurySedan', qty: 'wedQtyLuxurySedan', name: 'Luxury Sedan (Mercedes / BMW / Audi)', unit: 'Cars' },
        { check: 'wedVehSUV', qty: 'wedQtySUV', name: 'SUV (Fortuner / Innova)', unit: 'Cars' },
        { check: 'wedVehVintage', qty: 'wedQtyVintage', name: 'Vintage / Luxury Car (Bride/Groom Entry)', unit: 'Car' },
        { check: 'wedVehTempo', qty: 'wedQtyTempo', name: 'Tempo Traveller / Force Urbania', unit: 'Vans' },
        { check: 'wedVehBus', qty: 'wedQtyBus', name: 'Bus (Luxury Coach 22-45 Seater)', unit: 'Coaches' },
        { check: 'wedVehMixed', qty: 'wedQtyMixed', name: 'Mixed Fleet (Sedans, SUVs & Buses)', unit: 'Vehicles' }
      ];

      configs.forEach(item => {
        const cb = document.getElementById(item.check);
        const qty = document.getElementById(item.qty)?.value || '1';
        if (cb?.checked) {
          wedVehicles.push(`${item.name} (${qty} ${item.unit})`);
          wedBreakdown.push(` • ${item.name}: ${qty} ${item.unit}`);
        }
      });

      const wedVehiclesStr = wedVehicles.length > 0 ? wedVehicles.join(', ') : 'Not selected';
      const wedVehiclesDetails = wedBreakdown.length > 0 ? wedBreakdown.join('\n') : ' • Mixed fleet as per requirement';

      if (!wedName || !wedPhone || !wedEmail || !wedDates || !wedCity || !wedGuests) {
        alert('Please fill in all required Wedding & Event details:\n• Name\n• Phone / WhatsApp\n• Email\n• Event Date(s) & City\n• Number of Guests / Attendees');
        return;
      }

      const waText = 
`💍 *2. WEDDINGS & FAMILY EVENTS ENQUIRY — CabsByVelociti*
*Luxury Event Mobility | Pan India*
━━━━━━━━━━━━━━━━━━━━
👤 *Name:* ${wedName}
📱 *Phone / WhatsApp:* ${wedPhone}
📧 *Email:* ${wedEmail}
🎉 *Event Type:* ${wedType}
📅 *Event Date(s):* ${wedDates}
📍 *City:* ${wedCity}
🏨 *Venue Name(s):* ${wedVenues}
👥 *Number of Guests/Attendees:* ${wedGuests}
🚘 *Total Number of Vehicles Required:* ${wedTotalVehicles} Vehicles
🚗 *Vehicle Types & Breakdown:*
${wedVehiclesDetails}
💰 *Budget Range:* ${wedBudget}
📝 *Notes & Preferred Callback Time:*
"${wedNotes}"
━━━━━━━━━━━━━━━━━━━━
🌙 *Terms:* Night duty applicable only after 10:00 PM to 06:00 AM
📞 Direct Event Desk: +91 98180 91778
✉️ jaswinder@velociticabs.com
🌐 CabsByVelociti`;

      const mailSubject = encodeURIComponent(`[Wedding & Family Event] ${wedType} in ${wedCity} - ${wedName} (${wedTotalVehicles} Vehicles)`);
      const mailBody = encodeURIComponent(
`2. WEDDINGS & FAMILY EVENTS ENQUIRY — CabsByVelociti

CONTACT DETAILS:
Name: ${wedName}
Phone / WhatsApp: ${wedPhone}
Email: ${wedEmail}

EVENT SPECIFICATIONS:
Event Type: ${wedType}
Event Date(s): ${wedDates}
City: ${wedCity}
Venue Name(s): ${wedVenues}
Number of Guests / Attendees: ${wedGuests}

FLEET & VEHICLES REQUIRED:
Total Number of Vehicles Required: ${wedTotalVehicles} Vehicles
Vehicle Types & Quantity Breakdown:
${wedBreakdown.join('\n')}
Budget Range: ${wedBudget}

NOTES & PREFERRED CALLBACK TIME:
${wedNotes}

TERMS:
Night duty is applicable only after 10:00 PM to 06:00 AM.

--
Main Head Office: Near Plot No. A-7, Satsang Vihar Marg, Qutab Institutional Area, New Delhi - 110067
Email: jaswinder@velociticabs.com | Phone: +91 98180 91778`
      );

      window.open(`https://wa.me/919818091778?text=${encodeURIComponent(waText)}`, '_blank');
      setTimeout(() => {
        window.location.href = `mailto:jaswinder@velociticabs.com?subject=${mailSubject}&body=${mailBody}`;
      }, 900);

      closeEnquiryModal();
      showToastNotification('✅ Wedding & Family Events enquiry submitted! Opening WhatsApp & Email.');
      cabEnquiryForm.reset();
      return;
    }

    // =========================================================================
    // 3. CORPORATE EVENTS SUBMISSION
    // =========================================================================
    if (isEvtActive) {
      const evtCompany = document.getElementById('evtCompanyName')?.value.trim() || '';
      const evtDesig = document.getElementById('evtDesignation')?.value.trim() || '';
      const evtPerson = document.getElementById('evtContactPerson')?.value.trim() || '';
      const evtPhone = document.getElementById('evtPhone')?.value.trim() || '';
      const evtEmail = document.getElementById('evtEmail')?.value.trim() || '';
      const evtAttendee = document.getElementById('evtAttendeeType')?.value || 'delegates';
      const evtTransfer = document.getElementById('evtTransferType')?.value || 'airport/hotel/venue shuttle';
      const evtHotels = document.getElementById('evtHotelPoints')?.value.trim() || '';
      const evtSchedule = document.getElementById('evtSchedule')?.value.trim() || '';
      const evtCoord = document.getElementById('evtCoordinator')?.value || 'Yes';
      const evtRecurring = document.getElementById('evtRecurring')?.value || 'One-time event';
      const evtFleet = document.getElementById('evtFleetCount')?.value.trim() || 'As per requirement';
      const evtNotes = document.getElementById('evtNotes')?.value.trim() || 'None provided';

      if (!evtCompany || !evtDesig || !evtPerson || !evtPhone || !evtEmail || !evtHotels || !evtSchedule) {
        alert('Please fill in all required Corporate Event details:\n• Company Name & Your Designation\n• Contact Person, Phone & Email\n• Number of Hotels/Pickup Points\n• Event Schedule (Start/End Times, Daily)');
        return;
      }

      const waText = 
`🎤 *3. CORPORATE EVENTS ENQUIRY — CabsByVelociti*
*Conferences, Summits & Delegations | Pan India*
━━━━━━━━━━━━━━━━━━━━
🏢 *Company Name:* ${evtCompany}
💼 *Your Designation:* ${evtDesig}
👤 *Contact Person:* ${evtPerson}
📱 *Phone / WhatsApp:* ${evtPhone}
📧 *Work Email:* ${evtEmail}
👥 *Attendee Type:* ${evtAttendee}
🔄 *Transfer Type:* ${evtTransfer}
🏨 *Number of Hotels / Pickup Points:* ${evtHotels}
⏰ *Event Schedule (Start & End Times, Daily):* ${evtSchedule}
🛡️ *Dedicated On-Ground Coordinator:* ${evtCoord}
🔁 *One-Time or Recurring Event:* ${evtRecurring}
🚗 *Number of Vehicles Required:* ${evtFleet}
📝 *Estimated Fleet Size & Special Logistics Notes:*
"${evtNotes}"
━━━━━━━━━━━━━━━━━━━━
🌙 *Terms:* Night duty applicable only after 10:00 PM to 06:00 AM
📞 Direct Corporate Desk: +91 98180 91778
✉️ jaswinder@velociticabs.com
🌐 CabsByVelociti`;

      const mailSubject = encodeURIComponent(`[Corporate Event Logistics] ${evtCompany} - ${evtPerson} (${evtDesig})`);
      const mailBody = encodeURIComponent(
`3. CORPORATE EVENTS ENQUIRY — CabsByVelociti

ORGANIZATION & CONTACT:
Company Name: ${evtCompany}
Your Designation: ${evtDesig}
Contact Person: ${evtPerson}
Phone / WhatsApp: ${evtPhone}
Work Email: ${evtEmail}

LOGISTICS & TRANSFER SCOPE:
Attendee Type: ${evtAttendee}
Transfer Type: ${evtTransfer}
Number of Hotels / Pickup Points: ${evtHotels}
Event Schedule (Start & End Times, Daily): ${evtSchedule}
Dedicated On-Ground Coordinator: ${evtCoord}
Event Frequency: ${evtRecurring}

NUMBER OF VEHICLES REQUIRED:
${evtFleet}

SPECIAL LOGISTICS NOTES:
${evtNotes}

TERMS:
Night duty is applicable only after 10:00 PM to 06:00 AM.

--
Main Head Office: Near Plot No. A-7, Satsang Vihar Marg, Qutab Institutional Area, New Delhi - 110067
Email: jaswinder@velociticabs.com | Phone: +91 98180 91778`
      );

      window.open(`https://wa.me/919818091778?text=${encodeURIComponent(waText)}`, '_blank');
      setTimeout(() => {
        window.location.href = `mailto:jaswinder@velociticabs.com?subject=${mailSubject}&body=${mailBody}`;
      }, 900);

      closeEnquiryModal();
      showToastNotification('✅ Corporate Events enquiry submitted! Opening WhatsApp & Email.');
      cabEnquiryForm.reset();
      return;
    }

    // =========================================================================
    // 4. PART 1 RIDES, TOURS & SIGHTSEEING SUBMISSION (DEFAULT)
    // =========================================================================
    const tripName = formTripField?.value || hiddenServiceName?.value || 'General Cab Enquiry';
    const carRequired = formCarField?.value || 'Not specified';
    const travelDate = formDateField?.value || 'Not specified';
    const pickupTime = formTimeField?.value || 'Not specified';
    const days = formDaysField?.value || 'Same Day';
    const userName = document.getElementById('formNameField')?.value.trim() || '';
    const userEmail = document.getElementById('formEmailField')?.value.trim() || '';
    const userCountry = document.getElementById('formCountryField')?.value || 'India';
    const userPhone = document.getElementById('formPhoneField')?.value.trim() || '';
    const persons = document.getElementById('formPersonsField')?.value || '1';
    const vehiclesCount = document.getElementById('formVehiclesCountField')?.value || '1';
    const pickupLoc = document.getElementById('formPickupLocation')?.value.trim() || 'Delhi NCR';
    const dropLoc = document.getElementById('formDropLocation')?.value.trim() || 'Not specified';
    const subject = formSubjectField?.value || 'Cab Enquiry';
    const message = document.getElementById('formMessageField')?.value.trim() || '';

    if (!userName || !userPhone) {
      alert('Please fill in your Name and Contact Number to proceed with the enquiry.');
      return;
    }

    // Check Tour Package Inclusions (Hotel, Meals, Tour Guide)
    const includeHotel = document.getElementById('modalIncludeHotel')?.checked;
    const includeMeals = document.getElementById('modalIncludeMeals')?.checked;
    const includeGuide = document.getElementById('modalIncludeGuide')?.checked;
    let addonsBlockWa = '';
    let addonsBlockMail = '';

    if (includeHotel || includeMeals || includeGuide) {
      addonsBlockWa = 
`🛎️ *Tour Package Inclusions Selected:*
 • Hotel Stay Included: ${includeHotel ? 'YES (3★ / 4★ / 5★ Curated Stays)' : 'No'}
 • Meal Plans Included: ${includeMeals ? 'YES (Breakfast & Dinner)' : 'No'}
 • Licensed Tour Guide: ${includeGuide ? 'YES (Certified Heritage Guide)' : 'No'}\n`;

      addonsBlockMail = 
`Tour Package Inclusions Selected:
- Hotel Stay Included: ${includeHotel ? 'YES (3★ / 4★ / 5★ Curated Stays)' : 'No'}
- Meal Plans Included: ${includeMeals ? 'YES (Breakfast & Dinner)' : 'No'}
- Licensed Tour Guide: ${includeGuide ? 'YES (Certified Heritage Guide)' : 'No'}\n\n`;
    }

    // Check airport details
    const isAirport = isAirportTransferCheck?.checked;
    let airportBlockWa = '';
    let airportBlockMail = '';

    if (isAirport) {
      const transferType = formTransferType?.value || 'Airport Transfer';
      const flightNum = formFlightNumber?.value || 'To be shared';
      const flightTime = formFlightTime?.value || 'To be confirmed';

      airportBlockWa = 
`✈️ *Airport Transfer Details:*
 • Transfer Type: ${transferType}
 • Flight Number: ${flightNum}
 • Flight Arrival / Departure Time: ${flightTime}\n`;

      airportBlockMail = 
`Airport Transfer Details:
- Transfer Type: ${transferType}
- Flight Number: ${flightNum}
- Flight Departure/Arrival Time: ${flightTime}\n\n`;
    }

    // 1. Build WhatsApp message text formatted with markdown
    const waText = 
`🚗 *NEW ENQUIRY — CabsByVelociti*
*Mobility Simplified | Pan India Services*
━━━━━━━━━━━━━━━━━━━━
📌 *Trip / Service:* ${tripName}
📍 *Pickup Location:* ${pickupLoc}
🎯 *Drop Location:* ${dropLoc}
🚘 *Car Required:* ${carRequired}
📅 *Travel Date:* ${travelDate}
⏰ *Pickup Time:* ${pickupTime}
⏱️ *Duration / Stay:* ${days}
👤 *Client Name:* ${userName}
📧 *Email:* ${userEmail || 'Not specified'}
🌍 *Country:* ${userCountry}
📱 *Contact Number:* ${userPhone}
👥 *No. of Persons:* ${persons}
🚗 *No. of Vehicles / Cabs:* ${vehiclesCount}
${addonsBlockWa}${airportBlockWa}📝 *Subject:* ${subject}
💬 *Message:* 
"${message || 'None'}"
━━━━━━━━━━━━━━━━━━━━
🌙 *Terms:* Night duty applicable only after 10:00 PM to 06:00 AM
📞 Direct Business Number: +91 98180 91778
✉️ jaswinder@velociticabs.com
🌐 CabsByVelociti (Mobility Simplified)`;

    const encodedWaText = encodeURIComponent(waText);
    const waUrl = `https://wa.me/919818091778?text=${encodedWaText}`;

    // 2. Build Mailto link
    const mailSubject = encodeURIComponent(`[CabsByVelociti Enquiry] ${subject} - ${userName}`);
    const mailBody = encodeURIComponent(
`Trip / Service Name: ${tripName}
Pickup Location: ${pickupLoc}
Drop Location: ${dropLoc}
Car Required: ${carRequired}
Travel Date: ${travelDate}
Pickup Time: ${pickupTime}
Duration / Days: ${days}

Client Name: ${userName}
Email: ${userEmail || 'Not specified'}
Country: ${userCountry}
Contact Number: ${userPhone}
No. of Persons: ${persons}
No. of Vehicles / Cabs: ${vehiclesCount}

${addonsBlockMail}${airportBlockMail}Subject: ${subject}
Message:
${message || 'None'}

TERMS:
Night duty is applicable only after 10:00 PM to 06:00 AM.

--
Main Head Office: Near Plot No. A-7, Satsang Vihar Marg, Qutab Institutional Area, New Delhi - 110067
Email: jaswinder@velociticabs.com | Phone: +91 98180 91778`
    );
    const mailtoUrl = `mailto:jaswinder@velociticabs.com?subject=${mailSubject}&body=${mailBody}`;

    // 3. Open WhatsApp in new tab
    window.open(waUrl, '_blank');

    // 4. Trigger Email client after a brief delay
    setTimeout(() => {
      window.location.href = mailtoUrl;
    }, 900);

    // 5. Close modal and show notification toast
    closeEnquiryModal();
    showToastNotification('✅ Enquiry submitted! Opening WhatsApp & Email for automated dispatch.');
    cabEnquiryForm.reset();
  });

  // ---------- 13. Popular Routes: One Way vs Round Trip Interaction ----------
  document.querySelectorAll('.route-box-card').forEach(card => {
    const pills = card.querySelectorAll('.trip-pill-btn');
    const onewayInfo = card.querySelector('.oneway-info');
    const roundtripInfo = card.querySelector('.roundtrip-info');

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const selectedType = pill.getAttribute('data-type');
        if (selectedType === 'Round Trip') {
          onewayInfo?.classList.remove('active');
          roundtripInfo?.classList.add('active');
        } else {
          roundtripInfo?.classList.remove('active');
          onewayInfo?.classList.add('active');
        }
      });
    });

    const routeEnquireBtn = card.querySelector('.route-enquire-btn');
    routeEnquireBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      const baseName = routeEnquireBtn.getAttribute('data-base-name') || card.getAttribute('data-route-title') || 'Popular Route Tour';
      const activePill = card.querySelector('.trip-pill-btn.active');
      const tripType = activePill ? activePill.getAttribute('data-type') : 'One Way';
      const fullServiceName = `${baseName} (${tripType})`;

      let routePickup = 'Delhi NCR';
      let routeDrop = 'Outstation Destination';
      const lower = baseName.toLowerCase();
      if (lower.includes('agra mathura')) {
        routePickup = 'Delhi NCR'; routeDrop = 'Agra, Mathura & Vrindavan';
      } else if (lower.includes('delhi agra')) {
        routePickup = 'Delhi NCR'; routeDrop = 'Agra (Taj Mahal)';
      } else if (lower.includes('delhi jaipur')) {
        routePickup = 'Delhi NCR'; routeDrop = 'Jaipur (Pink City)';
      } else if (lower.includes('shimla manali')) {
        routePickup = 'Delhi NCR / Airport'; routeDrop = 'Shimla & Manali Hills';
      } else if (lower.includes('corbett nainital')) {
        routePickup = 'Delhi NCR'; routeDrop = 'Jim Corbett & Nainital';
      } else if (lower.includes('complete himachal')) {
        routePickup = 'Delhi NCR / Amritsar'; routeDrop = 'Himachal Circuit & Amritsar';
      } else if (lower.includes('agra chandigarh')) {
        routePickup = 'Agra / Delhi'; routeDrop = 'Chandigarh, Manali, Shimla';
      } else if (lower.includes('manali dalhousie')) {
        routePickup = 'Chandigarh / Delhi'; routeDrop = 'Manali & Dalhousie';
      } else if (lower.includes('golden triangle')) {
        routePickup = 'Delhi NCR'; routeDrop = 'Agra, Ranthambore & Jaipur';
      }

      openEnquiryModal(fullServiceName, routePickup, routeDrop);

      if (formDaysField) {
        if (tripType === 'One Way') {
          formDaysField.value = 'One Way Drop';
        } else {
          if (baseName.toLowerCase().includes('same day')) {
            formDaysField.value = 'Same Day Return';
          } else if (baseName.toLowerCase().includes('overnight')) {
            formDaysField.value = '2 Days / 1 Night';
          } else if (baseName.toLowerCase().includes('himachal') || baseName.toLowerCase().includes('shimla')) {
            formDaysField.value = '6 Days';
          } else if (baseName.toLowerCase().includes('golden triangle')) {
            formDaysField.value = '5 Days';
          } else {
            formDaysField.value = 'Round Trip Return';
          }
        }
      }
    });
  });

  // Global Route Trip Type Filter
  const routeFilterBtns = document.querySelectorAll('.route-filter-btn');
  routeFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      routeFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.getAttribute('data-trip-filter');

      document.querySelectorAll('.route-box-card').forEach(card => {
        const onewayPill = card.querySelector('.trip-pill-btn[data-type="One Way"]');
        const roundtripPill = card.querySelector('.trip-pill-btn[data-type="Round Trip"]');
        const onewayInfo = card.querySelector('.oneway-info');
        const roundtripInfo = card.querySelector('.roundtrip-info');

        if (mode === 'oneway') {
          onewayPill?.classList.add('active');
          roundtripPill?.classList.remove('active');
          onewayInfo?.classList.add('active');
          roundtripInfo?.classList.remove('active');
        } else if (mode === 'roundtrip') {
          roundtripPill?.classList.add('active');
          onewayPill?.classList.remove('active');
          roundtripInfo?.classList.add('active');
          onewayInfo?.classList.remove('active');
        }
      });
    });
  });

  // ---------- 14. Custom Trip Plan / Tailor-Made Itinerary Form ----------
  const customTripPlanForm = document.getElementById('customTripPlanForm');
  customTripPlanForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const startCity = document.getElementById('customStartCity')?.value || 'Delhi NCR';
    const destinations = document.getElementById('customDestinations')?.value || 'Custom Itinerary';
    const travelDate = document.getElementById('customTravelDate')?.value || 'Not specified';
    const pickupTime = document.getElementById('customPickupTime')?.value || '08:00';
    const tripDuration = document.getElementById('customTripDuration')?.value || '3 Days / 2 Nights';
    const carPreference = document.getElementById('customCarPreference')?.value || 'Toyota Innova Crysta';
    const persons = document.getElementById('customPersonsField')?.value || '2';
    const contactPhone = document.getElementById('customContactPhone')?.value || '';
    const clientName = document.getElementById('customClientName')?.value || '';
    const clientEmail = document.getElementById('customClientEmail')?.value || '';
    const itineraryNotes = document.getElementById('customItineraryNotes')?.value || 'Standard custom trip requested.';

    // Build WhatsApp message
    const waText = 
`🚗 *CUSTOM TRIP PLAN / ITINERARY REQUEST — CabsByVelociti*
*Mobility Simplified | Bespoke Travel Desk*
━━━━━━━━━━━━━━━━━━━━
📍 *Starting / Pickup City:* ${startCity}
🎯 *Destination(s) to Visit:* ${destinations}
📅 *Departure Date:* ${travelDate}
⏰ *Preferred Pickup Time:* ${pickupTime}
⏱️ *Estimated Duration:* ${tripDuration}
🚘 *Preferred Vehicle:* ${carPreference}
👥 *No. of Persons:* ${persons}
━━━━━━━━━━━━━━━━━━━━
👤 *Client Name:* ${clientName}
📱 *Phone Number:* ${contactPhone}
📧 *Email Address:* ${clientEmail}
📝 *Itinerary Notes & Special Requests:*
"${itineraryNotes}"
━━━━━━━━━━━━━━━━━━━━
🌙 *Terms:* Night duty is applicable only after 10:00 PM to 06:00 AM.
📞 Direct Concierge Helpline: +91 98180 91778
🌐 CabsByVelociti (Mobility Simplified)`;

    const encodedWaText = encodeURIComponent(waText);
    const waUrl = `https://wa.me/919818091778?text=${encodedWaText}`;

    // Build Mailto link
    const mailSubject = encodeURIComponent(`[Custom Itinerary Request] ${startCity} to ${destinations} - ${clientName}`);
    const mailBody = encodeURIComponent(
`CUSTOM TRIP PLAN / TAILOR-MADE ITINERARY REQUEST
------------------------------------------------
Starting / Pickup City: ${startCity}
Destination(s) to Visit: ${destinations}
Departure Date: ${travelDate}
Preferred Pickup Time: ${pickupTime}
Estimated Duration: ${tripDuration}
Preferred Vehicle Type: ${carPreference}
No. of Persons: ${persons}

Client Details:
Name: ${clientName}
Phone Number: ${contactPhone}
Email: ${clientEmail}

Itinerary Preferences & Special Notes:
${itineraryNotes}

--
Terms Notice: Night duty is applicable only after 10:00 PM to 06:00 AM.
Submitted via CabsByVelociti Custom Trip Planner.`
    );
    const mailtoUrl = `mailto:jaswinder@velociticabs.com?subject=${mailSubject}&body=${mailBody}`;

    // Open WhatsApp & Email
    window.open(waUrl, '_blank');
    setTimeout(() => {
      window.location.href = mailtoUrl;
    }, 900);

    showToastNotification('✅ Custom Itinerary submitted! Opening WhatsApp & Email for immediate booking.');
    customTripPlanForm.reset();
  });

  // ---------- 15. Hero Quick Booking Form (Part 1 Hero Bar) ----------
  const heroQuickBookingForm = document.getElementById('heroQuickBookingForm');
  heroQuickBookingForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const pickup = document.getElementById('heroPickupLoc')?.value || 'Delhi NCR';
    const drop = document.getElementById('heroDropLoc')?.value || 'Outstation Destination';
    const travelDate = document.getElementById('heroTravelDate')?.value;
    const pickupTime = document.getElementById('heroPickupTime')?.value || '09:00';
    const carPref = document.getElementById('heroCarPref')?.value || 'Innova Crysta';
    const persons = document.getElementById('heroPersons')?.value || '2';

    openEnquiryModal(`Cab Ride: ${pickup} to ${drop}`, pickup, drop);

    if (formDateField && travelDate) formDateField.value = travelDate;
    if (formTimeField && pickupTime) formTimeField.value = pickupTime;
    if (formCarField && carPref) formCarField.value = carPref;
    const formPersons = document.getElementById('formPersonsField');
    if (formPersons && persons) formPersons.value = persons;
  });

  // ---------- 16. Part 1 Main Ride Booking Form (Packages Hub Bar) ----------
  const part1RideBookingForm = document.getElementById('part1RideBookingForm');
  part1RideBookingForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const pickup = document.getElementById('p1Pickup')?.value || 'Delhi NCR';
    const drop = document.getElementById('p1Drop')?.value || 'Outstation Destination';
    const travelDate = document.getElementById('p1Date')?.value;
    const pickupTime = document.getElementById('p1Time')?.value || '09:00';
    const carPref = document.getElementById('p1Car')?.value || 'Innova Crysta';
    const persons = document.getElementById('p1Persons')?.value || '2';

    openEnquiryModal(`Cab Ride: ${pickup} to ${drop}`, pickup, drop);

    if (formDateField && travelDate) formDateField.value = travelDate;
    if (formTimeField && pickupTime) formTimeField.value = pickupTime;
    if (formCarField && carPref) formCarField.value = carPref;
    const formPersons = document.getElementById('formPersonsField');
    if (formPersons && persons) formPersons.value = persons;
  });

  // Toast Notification Helper
  function showToastNotification(msg) {
    const existingToast = document.getElementById('activeToast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.id = 'activeToast';
    toast.style.cssText = `
      position: fixed;
      bottom: 96px;
      left: 50%;
      transform: translateX(-50%);
      background: #111827;
      color: #FFFFFF;
      padding: 14px 28px;
      border-radius: 9999px;
      font-size: 0.92rem;
      font-weight: 600;
      z-index: 100000;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      border: 1.5px solid #22C55E;
      display: flex;
      align-items: center;
      gap: 10px;
      animation: fadeIn 0.3s ease;
    `;
    toast.innerHTML = msg;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.4s ease';
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  }

  // Smooth scroll and division switch for Foreign Clients section
  document.querySelectorAll('a[href="#international-clients-section"]').forEach(anchor => {
    anchor.addEventListener('click', () => {
      const part1Btn = document.querySelector('.division-btn[data-division="part1"]');
      if (part1Btn && !part1Btn.classList.contains('active')) {
        if (typeof window.switchDivision === 'function') {
          window.switchDivision('part1');
        }
      }
    });
  });

});
