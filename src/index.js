import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, IndexRoute, browserHistory, Link, Redirect} from 'react-router';
import {About} from './About';
import {Post, Posts} from './Post';
import './styles.scss';

const Nav = () => (
  <nav>
    <Link to="/about">About Me</Link>
  </nav>
)

const App = ({children}) => (
  <div>
    <header>
      <h1><Link to="/">Chris Loy</Link></h1>
      <Nav/>
    </header>

    <main>
      {children}
    </main>

    <footer>
      <nav>
        <Link to="https://github.com/chrisloy">
          <i className="fa fa-github" aria-hidden="true"></i>
        </Link>
        <Link to="https://twitter.com/chrisloy">
          <i className="fa fa-twitter" aria-hidden="true"></i>
        </Link>
        <Link to="https://www.linkedin.com/in/chrisloy/">
          <i className="fa fa-linkedin" aria-hidden="true"></i>
        </Link>
      </nav>
    </footer>
  </div>
)

const Home = () => (
  <div>
  {
    Posts.map(post => (
      <Link to={post.url} key={post.url} className="block">
        <div>
          <h1>{post.title}</h1>
          <h2 className="date">{post.date}</h2>
        </div>
      </Link>
    ))
  }
  </div>
)

const NotFound = () => <h1>:(</h1>

ReactDOM.render((
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={Home}/>
      <Route path="about" component={About}/>
      <Redirect from=":year/:month/:day/:fileId.html" to=":year/:month/:day/:fileId"/>
      <Route path=":year/:month/:day/:fileId" component={Post}/>
      <Route path="*" component={NotFound}/>
    </Route>
  </Router>
), document.getElementById('root'))
