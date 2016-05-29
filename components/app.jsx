// import React from 'react';
const React = require('react');

class AppComponent extends React.Component {
  render() {
    return (
      <div id="react-app">
        { this.props.children }
      </div>
    );
  }
};

module.exports = AppComponent;
