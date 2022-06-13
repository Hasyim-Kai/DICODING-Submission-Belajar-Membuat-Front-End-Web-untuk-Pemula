const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';

const generateId = () => +new Date();

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function loadDataFromStorage() {
    let data = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function searchBook(event){
    let searchedBookTitle = event.target.value;

    if(searchedBookTitle === ''){
        document.dispatchEvent(new Event(RENDER_EVENT));
    } else {
        let filteredBooks = books.filter( book => book.title.toLowerCase().includes(searchedBookTitle) )
        renderBooks(filteredBooks)
    }
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function addBookToFinished(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoBookFromFinished(bookId) {

    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

function removeBookFromFinished(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

document.addEventListener('DOMContentLoaded', function () {

    const submitForm = document.getElementById('form');

    submitForm.addEventListener('submit', event => {
        event.preventDefault();

        const title = document.getElementById('title-form').value;
        const author = document.getElementById('author-form').value;
        const year = document.getElementById('year-form').value;

        books.push({
            id: generateId(),
            title,
            author,
            year,
            isComplete: false
        });

        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    });

    if (isStorageExist()) { loadDataFromStorage(); }
});

function renderBooks(inputBooks = books){
    const uncompletedBookList = document.querySelector('#unfinishedBook section');
    const bookCompleted = document.querySelector('#finishedBook section');

    // clearing list item
    uncompletedBookList.innerHTML = '';
    bookCompleted.innerHTML = '';

    for (const bookItem of inputBooks) {
        const bookElement = makeBookWrapper(bookItem);

        if (bookItem.isComplete) {
            bookCompleted.innerHTML += bookElement;
        } else {
            uncompletedBookList.innerHTML += bookElement;
        }
    }
}

document.addEventListener(RENDER_EVENT, () => { renderBooks() });

function makeBookWrapper(bookObject) {
    const { id, title, author, year, isComplete } = bookObject;

    let bookButton = isComplete ? `<img onclick="undoBookFromFinished(${id})" src="asset/icons/back.svg" alt="Check">`
        : `<img onclick="addBookToFinished(${id})" src="asset/icons/check.svg" alt="Check">`;

    const bookItem = `<div class="bookItem" id="book-${id}">
        <div>
            <h3>${title}</h3>
            <p>${author}</p>
            <p>${year}</p>
        </div>

        <div class="bookItem-btn-wrapper">
            ${bookButton}
            <img onclick="openModal(${id})" src="asset/icons/delete.svg" alt="Check">
        </div>
    </div>`;

    return bookItem;
}

document.addEventListener(SAVED_EVENT, () => {
    console.log('Data berhasil di simpan.');
});


// ====== ON DELETE MODAL SCRIPT =============
var modal = document.getElementById("myModal");
// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
var delBtn = document.getElementById("del-btn");
const openModal = (bookId) => {
    modal.style.display = "block";
    delBtn.onclick = () => {
        removeBookFromFinished(bookId);
        closeModal();
    }
}

const closeModal = () => { modal.style.display = "none"; }

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}