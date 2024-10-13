document.addEventListener('DOMContentLoaded', () => {
  const mainCategories = document.querySelectorAll('.group > a');
  const mondrianBox = document.getElementById('mondrian-box');
  const subcategoryLinks = document.getElementById('subcategory-links');
  const searchInput = document.getElementById('search');
  let currentCategory = null;

  function showSubcategories(category) {
    const dropUpMenu = category.nextElementSibling;
    const subcategories = dropUpMenu.querySelectorAll('.drop-up-item');
    
    subcategoryLinks.innerHTML = '';
    subcategories.forEach((subcategory, index) => {
      const link = document.createElement('a');
      link.href = subcategory.href;
      link.textContent = subcategory.textContent;
      link.className = `p-4 m-2 text-center flex items-center justify-center transition-all duration-300 ease-in-out
                        ${getRandomColor()} ${getRandomSize()}`;
      link.style.minWidth = '100px';
      link.setAttribute('data-category', category.getAttribute('data-category'));
      
      subcategoryLinks.appendChild(link);
    });
    mondrianBox.classList.remove('hidden');
  }

  function getRandomColor() {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function getRandomSize() {
    const sizes = ['w-1/4', 'w-1/3', 'w-1/2'];
    return sizes[Math.floor(Math.random() * sizes.length)];
  }

  function updateURLAndFilter(category, tag) {
    const urlParams = new URLSearchParams(window.location.search);
    if (category) {
      urlParams.set('category', encodeURIComponent(category));
    } else {
      urlParams.delete('category');
    }
    if (tag) {
      urlParams.set('tag', encodeURIComponent(tag));
    } else {
      urlParams.delete('tag');
    }
    const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
    history.pushState(null, '', newUrl);
    
    if (typeof filterAndSortVideos === 'function') {
      filterAndSortVideos();
    } else {
      console.error('filterAndSortVideos function not found');
    }
  }

  function clearSearchAndFilter(category, tag) {
    if (searchInput) {
      if (category && tag) {
        searchInput.value = `${tag}`;
      } else if (category) {
        searchInput.value = category;
      } else {
        searchInput.value = '';
      }
    }
    updateURLAndFilter(category, tag);
  }

  mainCategories.forEach(category => {
    category.addEventListener('click', (e) => {
      e.preventDefault();
      const categoryValue = category.getAttribute('data-category');

      if (currentCategory === category) {
        mondrianBox.classList.add('hidden');
        currentCategory = null;
        clearSearchAndFilter(); // Clear URL when closing category
      } else {
        showSubcategories(category);
        currentCategory = category;
        clearSearchAndFilter(categoryValue);
      }
    });
  });

  // Close Mondrian box when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.group') && !e.target.closest('#mondrian-box')) {
      mondrianBox.classList.add('hidden');
      currentCategory = null;
    }
  });

  // Handle subcategory clicks
  subcategoryLinks.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      e.preventDefault();
      const category = e.target.getAttribute('data-category');
      const tag = e.target.textContent.trim();
      
      clearSearchAndFilter(category, tag);

      mondrianBox.classList.add('hidden');
      currentCategory = null;
      console.log(`Searching for subcategory: ${tag} in category: ${category}`);
    }
  });

  // Handle clicks on category links outside the header
  document.querySelectorAll('.category-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const category = link.getAttribute('data-category');
      clearSearchAndFilter(category);
    });
  });

  // Initial load: check URL parameters and set search/filter accordingly
  window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const tag = urlParams.get('tag');

    if (category) {
      const decodedCategory = decodeURIComponent(category);
      const decodedTag = tag ? decodeURIComponent(tag) : null;
      clearSearchAndFilter(decodedCategory, decodedTag);
    }
  });
});
