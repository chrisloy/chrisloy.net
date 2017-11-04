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
        <a href="https://github.com/chrisloy">
          <i className="fa fa-github" aria-hidden="true"></i>
        </a>
        <a href="https://twitter.com/chrisloy">
          <i className="fa fa-twitter" aria-hidden="true"></i>
        </a>
        <a href="https://www.linkedin.com/in/chrisloy/">
          <i className="fa fa-linkedin" aria-hidden="true"></i>
        </a>
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

const NotFound = () => (
  <div id="home">
    <h1>Not Found</h1>
    <p>
      <i>
        {"Life isn't about finding yourself. Life is about creating yourself."}
      </i>
    </p>
    <p>- George Bernard Shaw</p>
  </div>
)

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
