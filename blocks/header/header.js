// Drop-in Tools
import { events } from '@dropins/tools/event-bus.js';
// Cart dropin
import { publishShoppingCartViewEvent } from '@dropins/storefront-cart/api.js';
import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import renderAuthCombine from './renderAuthCombine.js';
import { renderAuthDropdown } from './renderAuthDropdown.js';
import { rootLink } from '../../scripts/scripts.js';

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  block.append(nav);
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['headline','left-menu','logo','right-menu','main-menu'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });
// Get the 2nd, 3rd, and 4th children (index 1, 2, and 3)
const second = nav.children[1];
const third = nav.children[2];
const fourth = nav.children[3];

// Create the new wrapper div
const navHeader = document.createElement('div');
navHeader.className = 'nav-header';

// Append the three elements into the new wrapper
navHeader.appendChild(second);
navHeader.appendChild(third);
navHeader.appendChild(fourth);

// Insert the new wrapper into the nav at the correct position (after the first child)
nav.insertBefore(navHeader, nav.children[1]);
const hamburger = document.createElement('div');
hamburger.className = 'hamburger';
hamburger.textContent = '☰';
const closeBtn = document.createElement('div');
closeBtn.className = 'close-btn';
closeBtn.textContent = '×';
// Insert hamburger as the first child
navHeader.insertBefore(hamburger, navHeader.firstChild);
// Insert close as the second child (after hamburger)
navHeader.insertBefore(closeBtn, navHeader.children[1]);
const sidebar=document.createElement('div');
sidebar.classList='sidebar';
sidebar.innerHTML=` <div class="menu-level-1"></div>
  <div class="menu-level-2" style="display:none;"></div>`;
navHeader.insertBefore(sidebar,navHeader.children[2]);
const level1 = sidebar.querySelector('.menu-level-1');
const level2 = sidebar.querySelector('.menu-level-2');
const sources = [
  document.querySelector('.nav-main-menu'),
  document.querySelector('.nav-left-menu'),
  document.querySelector('.nav-right-menu')
];
const navLeftMenu = document.querySelector('.nav-left-menu ul');
const items = navLeftMenu.querySelectorAll('li');

items.forEach((li) => {
  const text = li.textContent.trim();
  li.textContent = ''; // Clear existing content
  const a = document.createElement('a');
  a.textContent = text;
  a.href = '#';
  li.appendChild(a);
});
const navRightMenu=document.querySelector('.nav-right-menu ul');
const rightItems=navRightMenu.querySelectorAll(':scope > li');
rightItems.forEach((li) => {
    li.setAttribute('tabindex', '0');  
});
const navMainMenu = document.querySelector('.nav-main-menu ul');
const mainItems = navMainMenu.querySelectorAll(':scope > li');

// Step 1: Setup each top-level <li>
mainItems.forEach((li) => {
  li.setAttribute('tabindex', '0');

  li.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const submenu = li.querySelector('ul');

      // Close all other submenus
      mainItems.forEach((item) => {
        const sub = item.querySelector('ul');
        if (sub && sub !== submenu) {
          sub.style.display = 'none';
        }
      });

      // Toggle submenu
      if (submenu) {
        const isVisible = submenu.style.display === 'block';
        submenu.style.display = isVisible ? 'none' : 'block';
      }

      e.preventDefault(); // Prevent scroll
    }
  });
});

// Step 2: Close all submenus if Enter is pressed outside
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const active = document.activeElement;
    if (!navMainMenu.contains(active)) {
      mainItems.forEach((li) => {
        const submenu = li.querySelector('ul');
        if (submenu) submenu.style.display = 'none';
      });
    }
  }
});

const menuList = document.createElement('ul');
menuList.className = 'menu';

sources.forEach(source => {
  const topLevelLis = source.querySelectorAll(':scope .default-content-wrapper > ul > li');

  topLevelLis.forEach(topLi => {
    const item = document.createElement('li');
    const text = topLi.childNodes[0].textContent.trim();
    item.textContent = text;

    const nestedUl = topLi.querySelector(':scope > ul');
    if (nestedUl) {
      item.innerHTML = `
  <span class="item-text">${text}</span>
  <span class="arrow">›</span>
`;
      item.style.cursor = 'pointer';

      item.addEventListener('click', () => {
        // Build second level
        level1.style.display = 'none';
        level2.innerHTML = '';

        const back = document.createElement('div');
        back.textContent = '←';
        back.style.cursor = 'pointer';
        back.style.padding = '10px 0';
        back.addEventListener('click', () => {
          level2.style.display = 'none';
          level1.style.display = 'block';
        });

        const title = document.createElement('div');
        title.textContent = text;
        title.style.fontWeight = 'bold';
        title.style.padding = '10px 0';

        const subUl = document.createElement('ul');
        nestedUl.querySelectorAll(':scope > li').forEach(subLi => {
          const li = document.createElement('li');
          li.textContent = subLi.textContent.trim();
          subUl.appendChild(li);
        });

        level2.appendChild(back);
        level2.appendChild(title);
        level2.appendChild(subUl);
        level2.style.display = 'block';
      });
    }

    menuList.appendChild(item);
  });
});

level1.appendChild(menuList);

  
//  window.addEventListener('resize',mergeNavItemsForMobile);
hamburger.addEventListener('click', () => {
  if(window.innerWidth<744){
    sidebar.style.display = 'block'; // Show the sidebar
    closeBtn.style.display = 'block'; // Show the close button
    hamburger.style.display = 'none'; // Hide the hamburger
  }
});

// Hide sidebar when close button is clicked
closeBtn.addEventListener('click', () => {
  if(window.innerWidth<744){
    sidebar.style.display = 'none'; // Hide the sidebar
    closeBtn.style.display = 'none'; // Hide the close button
    hamburger.style.display = 'block'; // Show the hamburger again
  }
});

}