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
      displayValue: props.displayValue || props.value,
      invalidMessage: props.invalidMessage,
    };
  }

  onChange(event) {
    var newValue = event.target.value;
    console.log('New Value: ' + newValue);
    var invalidMessage = this.props.validate(newValue);
    
    if (typeof this.props.onChange === 'function') {
      this.props.onChange(newValue, this.state.value, this.props.label, invalidMessage);
    } 
    
    if (!invalidMessage) {
      this.setState({
        value: newValue,
        displayValue: newValue,
        invalidMessage: null,
      });
    } else {
      this.setState({
        displayValue: newValue,
        invalidMessage: invalidMessage,
      });
    }
  }

  render() {
    var invalidMessageDom;
    
    var invalidMessage = this.state.invalidMessage || this.props.invalidMessage;
    if (invalidMessage) {
      invalidMessageDom = <div className='db-input-invalid-msg'><span className="label label-danger">{invalidMessage}</span></div>;
    }

    if (!this.props.hideLabel && this.props.label) {
      return (
        <div className={'db-input' + (!this.state.valid ? ' db-input-invalid' : '')}>
          <div className="input-group input-group-sm">
            <span className="input-group-addon">{this.props.label}</span>
            {this.props.renderInputField(this.state.displayValue, this.onChange.bind(this))}
          </div>
          {invalidMessageDom}
        </div>
      );
    }

    return (
      <div className={'db-input' + (!this.state.valid ? ' db-input-invalid' : '')}>
        <div>
          {this.props.renderInputField(this.state.displayValue, this.onChange.bind(this))}
        </div>
      {invalidMessageDom}
      </div>
    );
  }
}


class ListInputField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value || [],
      displayValue: props.displayValue || props.value,
      invalidMessage: props.invalidMessage,
      childInvalidMessages: [],
    };
  }
  
  onChange(value, oldValue, index, childInvalidMessage) {
    var values = this.state.value;
    var childInvalidMessages = this.state.childInvalidMessages;
    
    values[index] = value;
    childInvalidMessages[index] = childInvalidMessage;
    
    var invalidMessage = childInvalidMessage ? 'Some values are not valid.' : null;

    if (typeof this.props.onChange === 'function') {
      this.props.onChange(values, this.state.value, this.props.label, invalidMessage);
    } 

    if (!invalidMessage) {
      this.setState({
        value: values,
        displayValue: values,
         v: [],
        invalidMessage: null,
      });
    } else {
      this.setState({
        displayValue: values,
        invalidMessage: invalidMessage,
        childInvalidMessages: childInvalidMessages,
      });
    }
  }

  render() {
    return (
      <InputField 
        label={this.props.label}
        displayValue={this.state.displayValue}
        invalidMessage={this.state.invalidMessage}
        renderInputField={(value) => {
          var doms = [];
          for(var i=0; i<value.length; i++) {
            doms.push(
              <div key={i}>
                <InputField key={'input-field'}
                  label={i}
                  hideLabel={true}
                  value={value[i]}
                  invalidMessage={this.state.childInvalidMessages[i]}
                  validate={this.props.validate}
                  onChange={(value, oldValue, index, childInvalidMessage) => {this.onChange(value, oldValue, index, childInvalidMessage);}}
                  renderInputField={this.props.renderInputField}
                />
                <div key={'delete'}>
                  Delete
                </div>
              </div>
            );
          }
          doms.push(<div key={'add'}>Add</div>)

          return doms;
        }}
      />
    );
  }
}

class TextInput extends React.Component {
  render() {
    return (
      <InputField 
        label={this.props.label}
        value={this.props.value}
        validate={this.props.validate}
        onChange={this.props.onChange}
        renderInputField={(value, onChange) => {
          return <input type='text' className='form-control' value={value} onChange={onChange}/>;
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

class DebugAssets extends React.Component {
  render() {
    return (
      <div>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"/>
        <script src='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js'></script>
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
        <DebugAssets/>
        <DebugTitle/>
        <TextInput 
          label='Refresh Rate (sec)'
          value={this.state.refreshRate}
          validate={(value) => {
            if (isNaN(value) || (parseInt(value, 10) != value)) {
              return 'Not an integer';
            }

            if (value <= 0) {
              return 'Not a positive integer'
            }
          }}
          onChange={(value) => {this.setDebugArgs('refreshRate', parseInt(value, 10));}}
        />

        <ListInputField 
          label="Test List Input"
          value={[1,2,3]}
          renderInputField={(value, onChange) => {
            return <input type='text' className='form-control' value={value} onChange={onChange}/>;
          }}
          validate={(value) => {
            if (isNaN(value) || (parseInt(value, 10) != value)) {
              return 'Not an integer';
            }

            if (value <= 0) {
              return 'Not a positive integer'
            }
          }}
          onChange={(value) => {console.log('changed to: ' + value);}}
        />
        
        <DebugArgs debugArgs={this.state} />
      </div>
    );
  }
}

ReactDOM.render(<DebugNav />, document.getElementById('debug-nav'));
//# sourceURL=douban-sofa-machine.js
