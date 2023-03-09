const lazyLoadItems = document.querySelectorAll('.lazy');

const lazyLoadObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    // console.log('intersection observer entry:', entry);

    if (entry.isIntersecting) {
      const lazyLoadItem = entry.target;
    //   console.log(lazyLoadItem);
    //   console.log('lazyLoadItem:', lazyLoadItem);
      lazyLoadItem.classList.remove('lazy'); // Remove the "lazy" class to avoid loading the same item multiple times
      loadLazyLoadItem(lazyLoadItem); // Load the content of the lazyLoadItem element here
      observer.unobserve(lazyLoadItem); // Stop observing the lazyLoadItem element once it's loaded
    }
  });
});

// Add each lazyLoadItem element to the IntersectionObserver
lazyLoadItems.forEach((lazyLoadItem) => {
  lazyLoadObserver.observe(lazyLoadItem);
});

function loadLazyLoadItem(lazyLoadItem) {
//   console.log('loading lazyLoadItem:', lazyLoadItem);
  const postThumbnail = lazyLoadItem.querySelector('.post-thumbnail');
  if (postThumbnail) {
    const postThumbnailImg = postThumbnail.querySelector('.post-img');
    postThumbnailImg.src = postThumbnailImg.dataset.src; // Load the image
  }
  // Load any other content of the lazyLoadItem element here
}

console.log('connected');


    let browserName = "";

    if(navigator.vendor.match(/google/i)) {
        browserName = 'chrome/blink';
    }
    else if(navigator.vendor.match(/apple/i)) {
        browserName = 'safari/webkit';
    }
    else if(navigator.userAgent.match(/firefox\//i)) {
        browserName = 'firefox/gecko';
    }
    else if(navigator.userAgent.match(/edge\//i)) {
        browserName = 'edge/edgehtml';
    }
    else if(navigator.userAgent.match(/trident\//i)) {
        browserName = 'ie/trident';
    }
    else
    {
        browserName = navigator.userAgent + "\n" + navigator.vendor;
    }
    alert(browserName);
