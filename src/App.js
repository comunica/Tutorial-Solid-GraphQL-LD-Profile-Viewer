import React from 'react';
import { LoggedIn, LoggedOut, AuthButton, Value, List, withWebId } from '@solid/react';
import { GraphQlLdProvider, Query } from 'solid-react-graphql-ld';
import gql from "graphql-tag";
import './App.css';

class App extends React.Component {
  state = { profileInput: '', activeProfile: '' };

  componentDidUpdate(prevProps) {
    const { webId } = this.props;
    if (webId && webId !== prevProps.webId)
      this.setState({ profileInput: webId });
  }

  viewProfile(profile) {
    this.setState({ profileInput: profile, activeProfile: profile });
  }

  render() {
    const { profileInput, activeProfile } = this.state;
    return (
      <div>
        <h1>Profile viewer</h1>
        <p>
          <LoggedOut>You are not logged in.</LoggedOut>
          <LoggedIn>You are logged in as <Value src="user.name"/>.</LoggedIn>
          <AuthButton popup="popup.html"/>
        </p>
        <p>
          <label htmlFor="profile">Profile:</label>
          <input id="profile" value={profileInput}
                 onChange={e => this.setState({ profileInput: e.target.value })}/>
          <button onClick={() => this.viewProfile(profileInput)}>View</button>
        </p>

        {activeProfile &&
        <GraphQlLdProvider sources={[ activeProfile ]}>
          <Query
            query={gql`query @single(scope: all) {
              name
              image
              friends @plural {
                id
                name @optional
              }
            }`}
          >
            {({ loading, error, data }) => {
              if (loading) return <p>Loading...</p>;
              if (error) return <p>Error: {error.toString()}</p>;
              console.log(data);
              return (
                <dl>
                  <dt>Full name</dt>
                  <dd>{data.name}</dd>
                  <dt>Image</dt>
                  <dd><img src={data.image} alt={data.name} width="100px" /></dd>
                  <dt>Friends</dt>
                  <dd>
                    <ul>
                      {
                        data.friends && data.friends.map(friend =>
                          <li key={friend.id}>
                            <button onClick={() => this.viewProfile(friend.id)}>
                              {friend.name || friend.id}
                            </button>
                          </li>)
                      }
                    </ul>
                  </dd>
                </dl>
              );
            }}
          </Query>
        </GraphQlLdProvider>}
      </div>
    );
  }
}

export default withWebId(App);
