document.addEventListener('DOMContentLoaded', function() {
  // Mark visited countries on the map
  const visitedCountries = [];
  
  // Get all country codes from the server-rendered data
  document.querySelectorAll('.country-card h3').forEach(element => {
    visitedCountries.push(element.textContent.trim());
  });

  console.log("Visited countries:", visitedCountries); // Debug: log countries to console

  // Mark each visited country on the map
  visitedCountries.forEach(countryCode => {
    const countryPath = document.getElementById(countryCode);
    if (countryPath) {
      countryPath.classList.add('visited');
      console.log(`Marked ${countryCode} as visited`); // Debug: log successful marking
    } else {
      console.log(`Could not find element for country code: ${countryCode}`); // Debug: log missing elements
      
      // Try alternative selectors - some SVG maps use different ID formats
      const alternativeSelectors = [
        `#${countryCode.toLowerCase()}`,
        `#${countryCode}_land`,
        `#${countryCode}-land`,
        `[data-id="${countryCode}"]`,
        `[data-code="${countryCode}"]`
      ];
      
      for (const selector of alternativeSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          element.classList.add('visited');
          console.log(`Marked ${countryCode} using selector ${selector}`);
          break;
        }
      }
    }
  });

  // Autocomplete for country input
  const countryInput = document.getElementById('countryInput');
  if (countryInput) {
    let currentFocus;
    
    // Function to show autocomplete results
    countryInput.addEventListener('input', function() {
      const val = this.value;
      closeAllLists();
      
      if (!val) { return false; }
      currentFocus = -1;
      
      // Create a container for autocomplete items
      const autocompleteList = document.createElement('div');
      autocompleteList.setAttribute('id', this.id + '-autocomplete-list');
      autocompleteList.setAttribute('class', 'autocomplete-items');
      this.parentNode.appendChild(autocompleteList);
      
      // Fetch country suggestions from the API
      fetch(`/api/countries?search=${val}`)
        .then(response => response.json())
        .then(data => {
          data.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.innerHTML = `<strong>${item.country_name.substr(0, val.length)}</strong>${item.country_name.substr(val.length)}`;
            itemDiv.addEventListener('click', function() {
              countryInput.value = item.country_name;
              closeAllLists();
            });
            autocompleteList.appendChild(itemDiv);
          });
        })
        .catch(error => console.error('Error fetching countries:', error));
    });
    
    // Keyboard navigation for autocomplete
    countryInput.addEventListener('keydown', function(e) {
      let x = document.getElementById(this.id + '-autocomplete-list');
      if (x) x = x.getElementsByTagName('div');
      
      if (e.keyCode === 40) { // Down arrow
        currentFocus++;
        addActive(x);
      } else if (e.keyCode === 38) { // Up arrow
        currentFocus--;
        addActive(x);
      } else if (e.keyCode === 13) { // Enter
        e.preventDefault();
        if (currentFocus > -1 && x) {
          x[currentFocus].click();
        }
      }
    });
    
    // Helper functions for autocomplete
    function addActive(x) {
      if (!x) return false;
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      x[currentFocus].classList.add('autocomplete-active');
    }
    
    function removeActive(x) {
      for (let i = 0; i < x.length; i++) {
        x[i].classList.remove('autocomplete-active');
      }
    }
    
    function closeAllLists(elmnt) {
      const x = document.getElementsByClassName('autocomplete-items');
      for (let i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != countryInput) {
          x[i].parentNode.removeChild(x[i]);
        }
      }
    }
    
    // Close autocomplete lists when clicking elsewhere
    document.addEventListener('click', function(e) {
      closeAllLists(e.target);
    });
  }
  
  // Preview uploaded image
  const photoInput = document.getElementById('photo');
  if (photoInput) {
    photoInput.addEventListener('change', function() {
      const fileLabel = this.previousElementSibling;
      if (this.files && this.files[0]) {
        fileLabel.textContent = this.files[0].name;
      } else {
        fileLabel.textContent = 'Upload Photo';
      }
    });
  }
});