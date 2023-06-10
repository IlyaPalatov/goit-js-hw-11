import axios from 'axios';
import Notiflix from 'notiflix';
// Описаний в документації
import SimpleLightbox from "simplelightbox";
// Додатковий імпорт стилів
import "simplelightbox/dist/simple-lightbox.min.css";

const API_KEY = '37184113-cc7f1841943926b48c61b8d8a';
const BASE_URL = 'https://pixabay.com/api/';
const ITEMS_PER_PAGE = 20;

const searchForm = document.querySelector('#searchForm');
const gallery = document.querySelector('#gallery');
const loadMoreButton = document.querySelector('#loadMoreButton');

let currentPage = 1;
let currentQuery = '';

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const searchQuery = event.target.elements.searchQuery.value.trim();
  if (searchQuery === '') {
    return;
  }

  clearGallery();
  currentPage = 1;
  currentQuery = searchQuery;
  searchImages(currentQuery);
});

loadMoreButton.addEventListener('click', () => {
  currentPage++;
  searchImages(currentQuery);
});

async function searchImages(query) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: currentPage,
        per_page: ITEMS_PER_PAGE,
      },
    });

    const { data } = response;
    const images = data.hits;
    const totalHits = data.totalHits;

    if (images.length === 0) {
      Notiflix.Notify.info('Sorry, there are no images matching your search query. Please try again.');
      return;
    }

    renderImages(images);

    if (images.length < totalHits) {
      showLoadMoreButton();
    } else {
      hideLoadMoreButton();
    }

    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    scrollToNextGroup();
  } catch (error) {
    console.error(error);
    Notiflix.Notify.failure('Oops! Something went wrong. Please try again.');
  }
}

function renderImages(images) {
  const galleryHTML = images
    .map((image) => createImageCard(image))
    .join('');

  gallery.insertAdjacentHTML('beforeend', galleryHTML);
  initLightbox();
}

function createImageCard(image) {
  return `
    <div class="photo-card">
      <a href="${image.largeImageURL}" data-lightbox="gallery">
        <img src="${image.webformatURL}" alt="${image.tags}" width="240" height="240">
      </a>
      <div class="info">
        <p class="info-item">Tags: ${image.tags}</p>
        <p class="info-item">Likes: ${image.likes}</p>
        <p class="info-item">Views: ${image.views}</p>
        <p class="info-item">Downloads: ${image.downloads}</p>
      </div>
    </div>
  `;
}


function clearGallery() {
  gallery.innerHTML = '';
}

function showLoadMoreButton() {
  loadMoreButton.style.display = 'block';
}

function hideLoadMoreButton() {
  loadMoreButton.style.display = 'none';
}

function scrollToNextGroup() {
  const topOfNextGroup = gallery.offsetTop + gallery.offsetHeight + 20;
  window.scrollTo({
    top: topOfNextGroup,
    behavior: 'smooth',
  });
}

function initLightbox() {
  const lightbox = new SimpleLightbox('.photo-card a');
  lightbox.on('show.simplelightbox', () => {
    document.querySelector('body').style.overflowY = 'hidden';
  });
  lightbox.on('close.simplelightbox', () => {
    document.querySelector('body').style.overflowY = 'auto';
  });
}
