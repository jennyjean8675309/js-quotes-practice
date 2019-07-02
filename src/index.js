// It might be a good idea to add event listener to make sure this file 
// only runs after the DOM has finshed loading.

document.addEventListener('DOMContentLoaded', function() {
    fetchQuotes()
    getNewQuoteForm().addEventListener('submit', addNewQuote)
})


function addNewQuote(e) {
    e.preventDefault()
    
    let newQuote = getNewQuoteInput().value
    let newAuthor = getNewAuthorInput().value

    quote = {
        quote: newQuote,
        author: newAuthor
    }

    fetch('http://localhost:3000/quotes?_embed=likes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(quote)
    }).then(response => response.json())
    .then(newQuoteObject => {
        console.log(newQuoteObject)
        displayQuote(newQuoteObject)
    })
}


function fetchQuotes() {
    fetch('http://localhost:3000/quotes?_embed=likes')
        .then(resp => resp.json())
        .then(quotes => quotes.forEach(quote => displayQuote(quote)))
}


function displayQuote(quote) {
    let quoteLi = document.createElement('li')
    quoteLi.dataset.quoteId = quote.id
    quoteLi.classList.add('quote-card')

    let quoteBlockquote = document.createElement('blockquote')
    quoteBlockquote.classList.add('blockquote')

    let quotePara = document.createElement('p')
    quotePara.classList.add('mb-0')
    quotePara.innerText = quote.quote

    let quoteFooter = document.createElement('footer')
    quoteFooter.classList.add('blockquote-footer')
    quoteFooter.innerText = quote.author

    let likesButton = document.createElement('button')
    likesButton.classList.add('btn-success')
    likesButton.innerHTML = `Likes: <span>${quote.likes.length}</span>`
    likesButton.addEventListener('click', () => addLike(quote))

    let deleteButton = document.createElement('button')
    deleteButton.classList.add('btn-danger')
    deleteButton.innerText = 'Danger - Delete'
    deleteButton.addEventListener('click', () => deleteQuote(quote))

    let editButton = document.createElement('button')
    editButton.classList.add('btn-success')
    editButton.innerText = 'Edit this Quote'
    editButton.addEventListener('click', () => showEditForm(quote))

    getQuoteList().appendChild(quoteLi)
    quoteLi.appendChild(quoteBlockquote)
    quoteBlockquote.append(quotePara, quoteFooter, likesButton, deleteButton, editButton)

    createEditForm(quote)
}


function createEditForm(quote) {
    let editForm = document.createElement('form')
    editForm.id = `edit-${quote.id}`
    editForm.dataset.show = false
    editForm.style.display = 'none'

    let quoteLabel = document.createElement('label')
    quoteLabel.innerText = 'Quote:'
    let quoteInput = document.createElement('input')
    quoteInput.value = quote.quote
    let authorLabel = document.createElement('label')
    authorLabel.innerText = 'Author:'
    let authorInput = document.createElement('input')
    authorInput.value = quote.author
    let quoteSubmit = document.createElement('input')
    quoteSubmit.type = 'submit'
    quoteSubmit.value = 'Submit Changes'

    editForm.append(quoteLabel, quoteInput, authorLabel, authorInput, quoteSubmit)
    getQuoteLi(quote).appendChild(editForm)

    editForm.addEventListener('submit', (event) => editQuote(quote))
}


function editQuote(quote) {
    event.preventDefault()
    
    let editedQuote = event.target.querySelectorAll('input')[0].value
    let editedAuthor = event.target.querySelectorAll('input')[1].value

    let updatedQuote = {
        quote: editedQuote,
        author: editedAuthor
    }
   
    fetch(`http://localhost:3000/quotes/${quote.id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(updatedQuote)
    }).then(response => response.json())
    .then(updateQuote => displayEditedQuote(updateQuote))
}


function displayEditedQuote(updatedQuote) {
    let quoteLi = getQuoteLi(updatedQuote)

    quoteLi.firstElementChild.querySelector('p').innerText = updatedQuote.quote
    quoteLi.firstElementChild.querySelector('footer').innerText = updatedQuote.author
}


function showEditForm(quote){
    let show = getEditForm(quote).dataset.show

    if (show === "false") {
        getEditForm(quote).style.display = 'block'
        getEditForm(quote).dataset.show = true
    } else {
        getEditForm(quote).style.display = 'none'
        getEditForm(quote).dataset.show = false
    }    
}


function addLike(quote) {
    quoteId = parseInt(quote.id)
    
    let newLike = {
        quoteId: quoteId, 
        createdAt: new Date()
    }

    fetch('http://localhost:3000/likes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(newLike)
    }).then(response => response.json())
    .then(like => addLikeToDOM(like, quote))
}


function addLikeToDOM(like, quote) {
    console.log('adding a like...', like, quote)
    
    let quoteLikeButton = getQuoteLi(quote).firstElementChild.children[2]
    quoteLikeButton.innerHTML = `Likes: <span>${++quote.likes.length}</span>`
}


function deleteQuote(quote) {
    console.log('deleting quote...', quote)
    fetch(`http://localhost:3000/quotes/${quote.id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }).then(response => response.json())
    .then(res => removeQuoteFromDOM(quote))
}


function removeQuoteFromDOM(quote) {
    let quoteLi = getQuoteLi(quote)
    getQuoteList().removeChild(quoteLi)
}

///// Function to return nodes /////

function getQuoteList() {
    return document.querySelector('#quote-list')
}

function getNewQuoteForm() {
    return document.querySelector('#new-quote-form')
}

function getNewQuoteInput() {
    return document.querySelector('#new-quote')
}

function getNewAuthorInput() {
    return document.querySelector('#author')
}

function getQuoteLi(quote) {
    return document.querySelector(`[data-quote-id='${quote.id}']`)
}

function getEditForm(quote) {
    return document.getElementById(`edit-${quote.id}`)
}
