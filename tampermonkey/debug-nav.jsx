const titleElement = (
  <div>
    <span>Debug Mode: {DoubanUtils.debugMode}</span>
  </div>
);

class DebugTitle extends React.Component {
  render() {
    return titleElement;
  }
}

class HelloMessage extends React.Component {
  render() {
    return (
      <div>
        <DebugTitle/>
        <div>Hello {this.props.name}</div>
      </div>
    );
  }
}

ReactDOM.render(<HelloMessage name="John" />, document.getElementById('debug-nav'));
