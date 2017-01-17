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
      value: props.value,
    };
  }

  onChange(event) {
    this.setState({
      value: event.target.value,
      dirty: true,
    });
  }

  render() {
    var valid = true;
    var invalidMessageDom;
    
    if (this.state.dirty && typeof this.props.validate === 'function') {
      var invalidMessage = this.props.validate(this.state.value);
      if (invalidMessage) {
        invalidMessageDom = <div className='db-input-invalid-msg'>{invalidMessage}</div>;
      }
    }

    return (
      <div className={'db-input' + (!valid ? ' db-input-invalid' : '')}>
        <div className='db-input-label'>
          {this.props.label}
        </div>
        <div className='db-input-field'>
          <div>
            {this.props.renderInputField(this.state.value, this.onChange.bind(this))}
          </div>
          {invalidMessageDom}
        </div>
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
          label='Refresh Rate (sec)'
          value='10'
          validate={(value) => {
            if (isNaN(value) || (parseInt(value, 10) != value)) {
              return 'Not a integer';
            }

            if (value <= 0) {
              return 'Not a positive integer'
            }
          }}
        />
      </div>
    );
  }
}

ReactDOM.render(<HelloMessage name="John" />, document.getElementById('debug-nav'));
