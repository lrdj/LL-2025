/**
 * The Lecture List - Main JavaScript
 */

(function() {
  'use strict';
  
  // Mobile navigation toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function() {
      navMenu.classList.toggle('active');
    });
  }
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      e.preventDefault();
      const target = document.querySelector(href);
      
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // Add loading state to buttons
  document.querySelectorAll('button[type="submit"], .btn').forEach(button => {
    button.addEventListener('click', function() {
      if (!this.classList.contains('no-loading')) {
        this.classList.add('loading');
      }
    });
  });
  
  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', function() {
    console.log('The Lecture List initialized');
  });
  
})();

