class RatingWidget extends HTMLElement {
  constructor() {
    super();
    this.maxRating = 5;
    this.build();
  }

  build() {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(this.styles());

    // const maxRating = 5;
    const starContainer = document.createElement('div');
    const stars = []
    for (let i = 1; i <= this.maxRating; i++) {
      const star = document.createElement('span');
      star.textContent = '\u{2606}';
      star.setAttribute('id', `star-${i}`);
      star.dataset.value = i;
      star.style.cursor = 'pointer';
      stars.push(star);
      starContainer.appendChild(star);

      star.addEventListener('mouseover', () => {
        for(let j = 0; j < i; j++){
          const currStar = stars[j];
          currStar.textContent = '\u{2605}';
        }
      });

      star.addEventListener('mouseout', () => {
        for(let j = 0; j < i; j++){
          const currStar = stars[j];
          currStar.textContent = '\u{2606}';
        }
      });

      stars.forEach(star => {
        star.addEventListener('click', (event) => this.rate(event));
      });
    }
    shadow.appendChild(starContainer);
  }

  styles() {
    const style = document.createElement('style');
    style.textContent = `
      div {
        display: inline-block;
      }
      span {
        font-size: 24px;
        color: black;
        cursor: pointer;
      }
      span:hover,
      span.hover {
        color: black;

      }
    `;
    return style;
  }

  rate(event) {
    const ratingValue = parseInt(event.target.dataset.value);
    this.updateStars(ratingValue);
    this.currentRating = ratingValue; // Update the current rating

    // Remove any existing message
    const existingMessage = this.shadowRoot.querySelector('.rating-message');
    if (existingMessage) {
      this.shadowRoot.removeChild(existingMessage);
    }

    // Update stars visually
    this.updateStars(ratingValue);

    // Prepare the data to be sent
    const formData = new FormData();

    formData.append('question', 'How satisfied are you?');
    formData.append('rating', ratingValue);
    formData.append('sentBy', 'JS');

    // Create the request
    const request = new XMLHttpRequest();
    request.open('POST', 'https://httpbin.org/post', true);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    request.setRequestHeader('X-Sent-By', 'JavaScript');

    // Convert FormData to URL encoded string
    const urlEncodedData = new URLSearchParams(formData).toString();

    // Send the request
    request.send(urlEncodedData);

    // Log the response to the console
    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        console.log(request.responseText);
      } else {
        // Reached the target server, but it returned an error
        console.error('Error on sending rating');
      }
    };

    request.onerror = function() {
      // There was a connection error of some sort
      console.error('Connection error');
    };

    // Show a message based on the rating value
    this.showMessage(ratingValue, this.maxRating);

    // Reset the stars after a delay
    setTimeout(() => {
      this.resetStars();
    }, 2000);
  }


  // Resets the stars to the default empty state
  resetStars() {
    const stars = this.shadowRoot.querySelectorAll('span');
    stars.forEach(star => {
      star.textContent = '\u{2606}';
    });

    // Remove the message
    const messageElement = this.shadowRoot.querySelector('.rating-message');
    if (messageElement) {
      this.shadowRoot.removeChild(messageElement);
    }

    this.currentRating = 0; // Reset current rating
  }


  // Updates the stars based on the rating value
  updateStars(value) {
    const stars = this.shadowRoot.querySelectorAll('span');
    stars.forEach((star, index) => {
      if (index < value) {
        star.textContent = '\u{2605}'; // Filled star
      } else {
        star.textContent = '\u{2606}'; // Empty star
      }
    });
  }

  // Function to show a message based on the rating
  showMessage(rating, maxRating) {
    console.log(rating);
    console.log(maxRating);
    let message = '';
    if (rating / maxRating >= 0.8) {
      message = `Thanks for ${rating} star rating!`;
    } else {
      message = `Thanks for your feedback of ${rating} stars. We'll try to do better.`;
    }
    this.displayMessage(message);
  }

  // Display the message on the page
  displayMessage(msg) {
    const pElement = document.createElement('p');
    pElement.className = 'rating-message'; // Add a class for easy selection
    pElement.innerHTML = msg;
    // Append the message to the shadow DOM
    this.shadowRoot.appendChild(pElement);
  }
}

customElements.define('rating-widget', RatingWidget);
