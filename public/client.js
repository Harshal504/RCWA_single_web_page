// client.js
const socket = io();

// Variable to track if there is a pending scroll update
let hasPendingScrollUpdate = false;

// Debounce function to limit the frequency of scroll updates
function debounce(func, wait) {
  let timeout;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

// Function to send HTML updates to the server
function sendHtmlUpdate() {
  requestAnimationFrame(() => {
    const textarea = document.querySelector('textarea');
    const select = document.getElementById('select');
    const radios = document.querySelectorAll('input[type="radio"]');
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const inputText = document.querySelectorAll('input[type="text"]');

    const textareaValue = textarea ? textarea.value : '';
    const selectValue = select ? select.value : '';
    const radioValues = [];
    const checkboxValues = [];
    const inputTextValues = [];

    radios.forEach((radio) => {
      radioValues.push(radio.checked);
    });

    checkboxes.forEach((checkbox) => {
      checkboxValues.push(checkbox.checked);
    });

    const updatedData = {
      html: document.documentElement.outerHTML,
      textareaValue: textareaValue,
      selectValue: selectValue,
      radioValues: radioValues,
      checkboxValues: checkboxValues,
      inputTextValues: inputTextValues
    };

    // Broadcast the updated HTML and form values to other clients
    socket.emit('htmlUpdate', updatedData);
  });
}


// Function to send scroll position updates to the server
function sendScrollUpdate() {
  const scrollY = window.scrollY;
  socket.emit('scrollUpdate', scrollY);
}

// Socket.IO event handler to receive HTML and form value updates from the server
socket.on('htmlUpdate', (updatedData) => {
  // Update the HTML structure and form values on the client side
  document.documentElement.innerHTML = updatedData.html;
  document.querySelector('textarea').value = updatedData.textareaValue;
  document.getElementById('select').value = updatedData.selectValue;

  if(updatedData.radioValues){
    const radios = document.querySelectorAll('input[type="radio"]')
    for(let i = 0; i < radios.length; i++){
      radios[i].checked = updatedData.radioValues[i];
    }
  }
 
  if(updatedData.checkboxValues){
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    for(let i = 0; i < checkboxes.length; i++){
      checkboxes[i].checked= updatedData.checkboxValues[i];
    }
  }



  const inputText = document.querySelectorAll('input[type="text"]');
  for(let i = 0; i < inputText.length; i++){
    inputText[i].value= updatedData.inputTextValues[i];
  }

  // Reattach event listeners to the textarea, select, and radio buttons
  document.querySelector('textarea').addEventListener('change', sendHtmlUpdate);
  document.getElementById('select').addEventListener('change', sendHtmlUpdate);
  document.querySelectorAll('input').forEach((inputs) => {
    inputs.addEventListener('change', sendHtmlUpdate);
  });
});

// Socket.IO event handler to receive scroll position updates from the server
socket.on('scrollUpdate', (updatedScrollY) => {
  // Update the scroll position of the client's HTML document
  window.scrollTo(0, updatedScrollY);
});

// Create a MutationObserver to track changes in the HTML structure and form values
// const observer = new MutationObserver(debounce(sendHtmlUpdate, 10000));
// observer.observe(document.documentElement, { childList: true, subtree: true });

// Add event listener to capture scroll events
window.addEventListener('scroll', debounce(sendScrollUpdate, 100));

// Function to send initial scroll position to the server
function sendInitialScrollPosition() {
  const scrollY = window.scrollY;
  socket.emit('scrollUpdate', scrollY);
}

// Wait for the page to fully load, then send the initial scroll position
window.addEventListener('load', sendInitialScrollPosition);

sendHtmlUpdate();