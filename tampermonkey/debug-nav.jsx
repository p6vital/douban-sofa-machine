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
  render() {
    var valid = true;

    if (typeof this.props.validate === 'function') {
      this.props.validate(this.props.value);
    }

    return (
      <div className="{!valid ? 'db-invalid' : ''}">
        <div>
          {this.props.label}
        </div>
        <div>
          {this.props.inputField}
        </div>
        <div>
          {this.props.invalidMessage}
        </div>
      </div>
    );
  }
}

class TextInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value
    };
  }

  render() {
    return (
      <InputField 
        label={this.props.label}
        validate={this.props.validate}
        invalidMessage='Not a valid input'
        inputFiled={
          <input type='text' value={this.state.value}/>
        } 
        value={this.state.value}/>
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
          value=''
          label='Test Input'
          validate={(value) => {
            return value;
          }}
        />
      </div>
    );
  }
}

ReactDOM.render(<HelloMessage name="John" />, document.getElementById('debug-nav'));
