// DeepLink Next - Extra JavaScript
// Handles instant navigation and dynamic behavior

document$.subscribe(function() {
  // Add target="_blank" to external links
  document.querySelectorAll('.md-content a[href^="http"]').forEach(function(link) {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });
});
