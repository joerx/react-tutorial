import React from 'react'
import ReactDOM from 'react-dom'
import marked from 'marked'
import uniqid from 'uniqid'

/**
 * Box o' komments
 */
class KommentBox extends React.Component {
  constructor(props) {
    super(props)
    this.state = {data: []}
    this.fetchData()
    setInterval(_ => this.fetchData(), this.props.pollInterval)
  }

  fetchData() {
    fetch(this.props.url)
      .then(res => res.json())
      .then(data => this.setState({data}))
  }

  onCommentSubmit(comment) {
    comment.id = uniqid()
    let data = this.state.data.concat([comment])
    this.setState({data})
    fetch('/api/comments', {
      method: 'post', 
      headers: {'content-type': 'application/json'},
      body: JSON.stringify(comment)
    })
    .then(res => res.json())
    .then(console.log)
  }

  render() {
    return (
      <div className='kommentBox'>
        <h1>Kommentare</h1>
        <KommentList data={this.state.data} />
        <KommentForm onCommentSubmit={c => this.onCommentSubmit(c)} />
      </div>
    )
  }
}

/**
 * List o' komments
 */
class KommentList extends React.Component {
  render() {
    let komments = this.props.data.map(k => (
      <Komment author={k.author} key={k.id}>{k.text}</Komment>
    ))
    return (
      <div className='kommentList'>
        {komments}
      </div>
    )
  }
}

/**
 * Form for komments
 */
class KommentForm extends React.Component {
  constructor() {
    super()
    this.state = {author: '', text: ''}
  }

  submit(e) {
    e.preventDefault()
    let author = this.state.author.trim()
    let text = this.state.text.trim()
    if (!text || !author) {
      return;
    }
    this.props.onCommentSubmit({author, text})
    this.setState({author: '', text: ''})
  }

  textChange(e) {
    this.setState({text: e.target.value})
  }

  authorChange(e) {
    this.setState({author: e.target.value})
  }

  render() {
    return (
      <form className='kommentForm' onSubmit={e => this.submit(e)}>
        <input type='text' 
          placeholder='Dein name' 
          value={this.state.author}
          onChange={e => this.authorChange(e)} /><br />
        <input type='text' 
          placeholder='Sag was...' 
          value={this.state.text}
          onChange={e => this.textChange(e)} /><br />
        <button type='submit'>Absenden</button>
      </form>
    )
  }
}

function rawMarkup(children) {
  let markup = marked(children.toString(), {sanitize: true})
  return {__html: markup}
}

/**
 * A komment
 */
class Komment extends React.Component {
  render() {
    return (
      <div className='komment'>
        <h2 className='commentAuthor'>
          {this.props.author}
        </h2>
        <span dangerouslySetInnerHTML={rawMarkup(this.props.children)} />
      </div>
    )
  }
}

// Make shit happen
ReactDOM.render(
  <KommentBox url='/api/comments' pollInterval={10000}/>,
  document.getElementById('content')
)
