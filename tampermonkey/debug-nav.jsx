class DebugTitle extends React.Component {
  render() {
    return (
      <div>
        <span>Debug Mode: {DoubanUtils.debugMode}</span>
      </div>
    );
  }
}

class InputField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value
    };
  }

  onChange(event) {
    this.setState({value: event.target.value});
  }

  render() {
    var valid = true;

    if (typeof this.props.validate === 'function') {
      valid = this.props.validate(this.state.value);
    }

    var invalidMessage = null;
    if(!valid) {
      invalidMessage = <div className='db-invalid-msg'>{this.props.invalidMessage}</div>;
    }

    return (
      <div className={!valid ? 'db-invalid' : ''}>
        <div>
          {this.props.label}
        </div>
        <div>
          {this.props.renderInputField(this.state.value, this.onChange.bind(this))}
        </div>
        {invalidMessage}
      </div>
    );
  }
}

class TextInput extends React.Component {
  render() {
    return (
      <InputField 
        label={this.props.label}
        value={this.props.value}
        invalidMessage={this.props.invalidMessage}
        validate={this.props.validate}
        renderInputField={(value, onChange) => {
          return <input type='text' value={value} onChange={onChange}/>;
        }} />
      );
    }
  }

class HelloMessage extends React.Component {
  render() {
    return (
      <div>
        <DebugTitle/>
        <div>Hello {this.props.name}</div>
        <TextInput 
          label='Test Input'
          value=''
          invalidMessage='Invalid test input'
          validate={(value) => {
            console.log('Validating input test value: ' + value);
            return value;
          }}
        />
      </div>
    );
  }
}

ReactDOM.render(<HelloMessage name="John" />, document.getElementById('debug-nav'));
