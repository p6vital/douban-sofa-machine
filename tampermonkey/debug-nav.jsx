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
      displayValue: props.value,
      valid: true,
      invalidMessage: null,
    };
  }

  onChange(event) {
    var newValue = event.target.value;
    console.log('New Value: ' + newValue);
    var invalidMessage = this.props.validate(newValue);
    
    if (!invalidMessage) {
      if (typeof this.props.onChange === 'function') {
        this.props.onChange(newValue);
      } 

      this.setState({
        value: newValue,
        displayValue: newValue,
        valid: true,
        invalidMessage: null,
      });
    } else {
      this.setState({
        displayValue: newValue,
        valid: false,
        invalidMessage: invalidMessage,
      });
    }
  }

  render() {
    var invalidMessageDom;
    
    if (!this.state.valid) {
      invalidMessageDom = <div className='db-input-invalid-msg'>{this.state.invalidMessage}</div>;
    }

    return (
      <div className={'db-input' + (!this.state.valid ? ' db-input-invalid' : '')}>
        <div className='db-input-label'>
          {this.props.label}
        </div>
        <div className='db-input-field'>
          <div>
            {this.props.renderInputField(this.state.displayValue, this.onChange.bind(this))}
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
        onChange={this.props.onChange}
        renderInputField={(value, onChange) => {
          return <input type='text' value={value} onChange={onChange}/>;
        }}
      />
    );
  }
}

class DebugArgs extends React.Component {
  render() {
    var doms = [];
    for (var key in this.props.debugArgs) {
      doms.push(<div key={key}>{key}: {this.props.debugArgs[key]}</div>);
    }
    
    return (
      <div>
        <div>Debug Args:</div>
        {doms}
      </div>
    )
  }
}

class DebugNav extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      refreshRate: 10
    };
  }

  setDebugArgs(key, value) {
    var newState = {};
    newState[key] = value;
    this.setState(newState);
  }

  render() {
    return (
      <div>
        <DebugTitle/>
        <TextInput 
          label='Refresh Rate (sec)'
          value={this.state.refreshRate}
          validate={(value) => {
            if (isNaN(value) || (parseInt(value, 10) != value)) {
              return 'Not a integer';
            }

            if (value <= 0) {
              return 'Not a positive integer'
            }
          }}
          onChange={(value) => {this.setDebugArgs('refreshRate', parseInt(value, 10))}}
        />
        
        <DebugArgs debugArgs={this.state} />
      </div>
    );
  }
}

ReactDOM.render(<DebugNav />, document.getElementById('debug-nav'));
