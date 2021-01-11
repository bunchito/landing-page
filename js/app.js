/**
 * 
 * Manipulating the DOM exercise.
 * Exercise programmatically builds navigation,
 * scrolls to anchors from navigation,
 * and highlights section in viewport upon scrolling.
 * 
 * Dependencies: None
 * 
 * JS Version: ES2015/ES6
 * 
 * JS Standard: ESlint
 * 
 */

/**
 * Define Global Variables
 * 
 */

const navContainer = document.querySelector("header[class='page__header'] > nav > ul");
const sections = document.querySelectorAll("main section[id^='section']");
let sectionsOffsets = {};

// This will be used to set the number to be subtracted in the scrollTo() method either for mobile or desktop
let intFrameWidth;
const spaceForMenu = {
  desktop: 0,
  mobile: 190
};

/*
The toggle button is added dynamically (not part of the markup). I'm targeting when it is in the DOM.
Potentially, I could also have responded to load event.
*/
let toggle;

let parsedSectionData;

let timer;

/**
 * End Global Variables
 * Start Helper Functions
 * 
 */

/**
 * Retrieves if the view correspond to a mobile or desktop menu
 * @param  {Number} width The inner width of the window
 * @return {String}       Either 'mobile' or 'desktop'
 */
const widthType = (width) => {
  if (width <= 1024) {
    return 'mobile';
  }
  return 'desktop';
}

/**
 * 
 * @param  {Number} width The inner width of the window
 */
const scrollToHelper = (screenWidth, elementId, listofElementsById, spaceForMenu) => {
    // Scroll to anchor ID using scrollTo() event
    // I wanted to use scrollIntoView() but the code says scrollTo()
    const scrollTo = listofElementsById[elementId] - 40 - spaceForMenu[widthType(screenWidth)];
    window.scrollTo({
      top: scrollTo,
      behavior: 'smooth',
    });
}

/**
 * Handler for click listener
 * @param  {HTMLLIElement} target The clicked LI
 */
const onClickHandler = ({ target }) => {
  if (target.nodeName === 'LI' && target.textContent.toLowerCase().includes('section')) {
    // Scroll to section on link click
    scrollToHelper(intFrameWidth, target.textContent, sectionsOffsets, spaceForMenu);
  }
}

const parseData = (sections) => {
  const result = [];
  for (let section of sections) {
    const {
      classList,
      dataset: {
        nav
      },
      offsetTop
    } = section;
    result.push({ section: nav, class: classList.value, offsetTop });
  }
  return result;
}

/** 
 * This is a sample shape of parsedSectionData
  [
    {section: "Section 1", class: "", offsetTop: 465},
    {section: "Section 2", class: "", offsetTop: 986},
    {section: "Section 3", class: "", offsetTop: 1506},
    {section: "Section 4", class: "", offsetTop: 2027},
    {section: "Section 5", class: "", offsetTop: 2548}
  ]
*/

parsedSectionData = parseData(sections);

/**
 * Parses parsedSectionData
 * @param  {Array} parsedSectionData The parsed data of Sections collections
 * @return {Object}                  Containing the [Section Id]: xOffset
 */
const parsedSectionOffsets = (parsedSectionData) => {
  const result = {};
  for (let element of parsedSectionData) {
    result[element.section] = element.offsetTop;
  }
  return result;
}

/**
 * This is a sample shape of sectionsOffsets
  {Section 1: 465, Section 2: 986, Section 3: 1506, Section 4: 2027, Section 5: 2548}
 */

sectionsOffsets = parsedSectionOffsets(parsedSectionData);


// Remove ALL classes and add class to element
const removeClasses = (listOfElements) => {
  for (let element of listOfElements) {
    element.classList.remove('active');
  }
}

const addClassToElement = (elementId) => {
  document.querySelector(`main section[id=${elementId}]`).classList.add('active');
}

/**
 * Toggle visibility of Mobile Menu
 * @param  {Node} navContainer The menu wrapper
 * @param  {Node} toggle   The element that toggles
 */
const onToggleMenu = (navContainer, toggle) => {
  if (navContainer.classList.contains('active')) {
    navContainer.classList.remove('active');
    toggle.classList.remove('fa-times');
  } else {
    navContainer.classList.add('active');
    toggle.classList.add('fa-times');
  }
}

/**
 * Handler for resize listener
 * When the window is resized...
 *   we re-scrape the markup and parse it > parseData
 *   we parse and generate the new object with the x offsets > parsedSectionOffsets
 *   we get the new inner width of the window
 */
const onResizeWindow = () => {
  parsedSectionData = parseData(sections);
  sectionsOffsets = parsedSectionOffsets(parsedSectionData);

  // We need ro recalculate the width
  intFrameWidth = window.innerWidth;
}

const onScrollWindow = () => {
  // KUDOS to https://stackoverflow.com/questions/4620906/how-do-i-know-when-ive-stopped-scrolling/4620986#4620986
  if (timer) {
    clearTimeout(timer);
  }
  timer = setTimeout(function() {
    
  for (let offSet in sectionsOffsets) {
    const currentScrollingPosition = window.scrollY;

    if (currentScrollingPosition < sectionsOffsets[offSet]) {
      removeClasses(sections);

      // Add class 'active' to section when near top of viewport
      addClassToElement(offSet.toLowerCase().split(' ').join(''))
      break;
    }
  }
  }, 150);
};

/**
 * End Helper Functions
 * Begin Main Functions
 * 
 */

/**
 * Builds the menu or nav
 * @param  {Array} parsedSectionData The parsed data of Sections collections (parsedSectionData)
 * @return {String}                  Stringified markup for menu
 */
const navItems = (data) => {
  // Want to be extra careful and just match sections with ids section*
  let navStructure = '';
  for (let item of data) {
    navStructure += `<li class="item">${item.section}</li>`;
  }
  return navStructure;
}


// Build menu 

/* I checked this article about innerHTML performance: 
https://medium.com/@kevinchi118/innerhtml-vs-createelement-appendchild-3da39275a694
and I think this is a good case to use it without doing expensive operations
I will appreciate advise
*/
navContainer.innerHTML = `<li class="logo">Landing!</li>${navItems(parsedSectionData)}<li class="toggle"><a href="#"><i class="fas fa-bars"></i></a></li>`;

// After we add the HTML, the button with the toggle functionality will be available for JS
toggle = document.querySelector('ul > li.toggle i.fas');

intFrameWidth = window.innerWidth;


/**
 * End Main Functions
 * Begin Listeners
 * 
 */

navContainer.addEventListener('click', onClickHandler);

toggle.addEventListener('click', onToggleMenu.bind(null, navContainer, toggle));

// We adjust the scrollTo values if user resizes the window
window.addEventListener('resize', onResizeWindow);

// Set sections as active (once the "scrolling finishes")
window.addEventListener('scroll', onScrollWindow);