class FieldDisplay extends React.Component {
  render() {
    var labelDom;
    if (typeof this.props.label !== 'undefined') {
      labelDom = <div className="db-display-label" style={{float:'left', width:'100px'}}>{this.props.label}</div>
    }
    
    return (
      <div className="'db-display" style={{clear:'left'}}>
        {labelDom}
        <div>
          {this.props.fieldDisplay}
        </div>
      </div>
    );
  }
}

class InputFieldDisplay extends React.Component {
  render() {
    var invalidMessageDom;
    if (this.props.invalidMessage) {
      invalidMessageDom = <div className='db-input-invalid-msg'><span className="label label-danger">{this.props.invalidMessage}</span></div>;
    }

    var labelDom;
    if (typeof this.props.label !== 'undefined') {
      labelDom = <div className="db-input-label" style={{display:'inline-block', width:'100px'}}>{this.props.label}</div>
    }
    
    return (
      <div className={'db-input' + (this.props.invalidMessage ? ' db-input-invalid' : '')} style={{marginBottom:'5px'}}>
        {labelDom}
        <div style={{display:'inline-block'}}>
          {this.props.renderInputField(this.props.displayValue, this.props.onChange)}
          {invalidMessageDom}
        </div>
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

  onChange(newValue) {
    console.log('InputField:' + this.props.inputKey + ': Changing value to ' + newValue);
    var invalidMessage = this.props.validate(newValue);
    
    if (typeof this.props.onChange === 'function') {
      this.props.onChange(newValue, this.state.value, this.props.inputKey, invalidMessage);
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
    return (
      <InputFieldDisplay
        label={this.props.label}
        renderInputField={this.props.renderInputField}
        invalidMessage={this.state.invalidMessage}
        displayValue={this.state.displayValue}
        onChange={this.onChange.bind(this)}
      />
    );
  }
}


class ListInputField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value || [],
      displayValue: props.displayValue || props.value.slice(),
      invalidMessage: props.invalidMessage,
      childInvalidMessages: [],
      keys: (function() {
        var keys=[];
        for(var i=0; i<props.value.length;i++){
          keys.push(i);
        }
        return keys;
      })(),
    };
  }

  validate(childInvalidMessages){
    var invalid = false;
    var invalidCount = 0;
    for (var i=0; i<childInvalidMessages.length; i++) {
      if (childInvalidMessages[i]) {
        invalid = true;
        invalidCount++;
      }
    }
    
    return invalid ? invalidCount + ' field(s) have invalid value(s).' : null;
  }
  
  onChange(value, oldValue, index, childInvalidMessage) {
    var values = this.state.value.slice();
    var displayValues = this.state.displayValue.slice();
    var childInvalidMessages = this.state.childInvalidMessages;
    
    values[index] = value;
    displayValues[index] = value;
    console.log('ListInputField:' + this.props.inputKey + ': Changing value to ' + displayValues);
    
    childInvalidMessages[index] = childInvalidMessage;

    var invalidMessage = this.validate(childInvalidMessages);

    if (typeof this.props.onChange === 'function') {
      this.props.onChange(displayValues, this.state.value, this.props.inputKey, invalidMessage);
    } 

    if (!invalidMessage) {
      this.setState({
        value: values.slice(),
        displayValue: displayValues.slice(),
        invalidMessage: null,
        childInvalidMessages:[],
      });
    } else {
      this.setState({
        displayValue: displayValues.slice(),
        invalidMessage: invalidMessage,
        childInvalidMessages: childInvalidMessages,
      });
    }
  }

  remove(index) {
    console.log('ListInputField:' + this.props.inputKey + ': Deleting item at index ' + index);
    var value = this.state.value;
    var displayValue = this.state.displayValue;
    var childInvalidMessages = this.state.childInvalidMessages;
    var keys = this.state.keys;
    
    value.splice(index, 1);
    displayValue.splice(index, 1);
    childInvalidMessages.splice(index, 1);
    keys.splice(index, 1);
    
    var invalidMessage = this.validate(childInvalidMessages);

    if (typeof this.props.onChange === 'function') {
      this.props.onChange(value, this.state.value, this.props.inputKey, invalidMessage);
    } 

    this.setState({
      value: value,
      displayValue: displayValue,
      invalidMessage: invalidMessage,
      childInvalidMessages: childInvalidMessages,
      keys: keys,
    });
  }

  add(){
    console.log('ListInputField:' + this.props.inputKey + ': Adding new item..');
    var value = this.state.value;
    var displayValue = this.state.displayValue;
    var childInvalidMessages = this.state.childInvalidMessages;
    var keys = this.state.keys;
    var size = keys.length;
    
    value[size] = this.props.defaultValue;
    displayValue[size] = this.props.defaultValue;
    keys[size] = keys[size-1] + 1;
    
    var invalidMessage = this.state.invalidMessage;

    if (typeof this.props.onChange === 'function') {
      this.props.onChange(value, this.state.value, this.props.inputKey, invalidMessage);
    } 

    this.setState({
      value: value,
      displayValue: displayValue,
      invalidMessage: invalidMessage,
      childInvalidMessages: childInvalidMessages,
      keys: keys,
    });
  }

  render() {
    return (
      <InputFieldDisplay 
        label={this.props.label}
        invalidMessage={this.state.invalidMessage}
        displayValue={this.state.displayValue}
        renderInputField={(value) => {
          var doms = [];
          for(var i=0; i<value.length; i++) {
            doms.push(
              <div key={this.state.keys[i]} style={{clear:'right'}}>
                <div key={'delete'} style={{float:'right', marginLeft: '5px'}}>
                  <a href="#" onClick={function(index){
                    return function() {
                      this.remove(index);
                    }.bind(this);
                  }.bind(this)(i)}>Delete</a>
                </div>
                <div style={{float:'right'}}>
                  <InputField 
                    key={'input-field'}
                    inputKey={i}
                    value={value[i]}
                    validate={this.props.validate}
                    onChange={(value, oldValue, index, childInvalidMessage) => {this.onChange(value, oldValue, index, childInvalidMessage);}}
                    renderInputField={this.props.renderInputField}
                  />
                </div>
              </div>
            );
          }
          doms.push(<div key={'add'}>
            <a href="#" onClick={this.add.bind(this)}>Add</a>
          </div>)

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
        onChange={(value, oldValue, inputKey, invalidMessage) => {
            if (typeof this.props.onChange === 'function') {
              this.props.onChange(value, oldValue, inputKey, invalidMessage);
            } 
          }
        }
        renderInputField={(value, onChange) => {
          return <input type='text' className='form-control' value={value} onChange={(event) => {onChange(event.target.value);}}/>;
        }}
      />
    );
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

class DebugTitle extends React.Component {
  render() {
    return (
      <div>
        <span>Debug Mode: {DoubanUtils.debugMode}</span>
      </div>
    );
  }
}

class DebugControl extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: 'stopped'
    };
  }

  render() {
    
    var buttonDom = this.state.status === 'stopped' ? (
      <input id="db-start-button" type="button" className="btn btn-default" value="Start"
        onClick={()=>{
          if (typeof this.props.onStart === 'function') {
            this.props.onStart();
          }
          this.setState({
            status: 'started',
          });
        }}
      />
    ) : (
      <input id="db-start-button" type="button" className="btn btn-default" value="Stop"
        onClick={()=>{
          if (typeof this.props.onStop === 'function') {
            this.props.onStop();
          }
          this.setState({
            status: 'stopped',
          });
        }}
      />
    );
    
    return (
      <div>
        {buttonDom}
      </div>
    )
  }
}

class DebugNav extends React.Component {
  constructor(props) {
    super(props);
    
    var debugArgs
    try {
      var jsonStr = localStorage.getItem('douban-debug');
      if (jsonStr) {
        debugArgs = JSON.parse(jsonStr);
      }
    } catch(e) {
      console.log('Error getting data from local storage.');
    }

    if (!debugArgs || typeof debugArgs !== 'object') {
      debugArgs = {};
    }
    
    debugArgs.refreshRate = typeof debugArgs.refreshRate !== undefined ? debugArgs.refreshRate : 10;
    if (!debugArgs.comments || Array !== debugArgs.comments.constructor) {
      debugArgs.comments = [
        'Test comment #1',
        'Test comment #2',
        'Test comment #3',
        'Test comment #4',
        'Test comment #5',
      ];
    }

    this.state = {
      debugArgs: debugArgs,
      repliedThreads: {},
    };
  }

  setDebugArgs(key, value) {
    var newState = this.state.debugArgs;
    newState[key] = value;
    this.setState({debugArgs: newState});
    localStorage.setItem('douban-debug', JSON.stringify(newState));
  }

  render() {
    return (
      <div className="panel panel-primary" style={{minWidth:'950px'}}>
        <div className="panel-heading">
          <DebugAssets/>
          <DebugTitle/>
        </div>
        <div className="panel-body">
          <div style={{clear:'right'}}>
            <div style={{float: 'right',width:'360px'}}>
              <FieldDisplay
                label="Debug Args"
                fieldDisplay={
                  <pre>{JSON.stringify(this.state.debugArgs,null,2)}</pre>
                }
              />
              <FieldDisplay
                label="Replied Threads"
                fieldDisplay={
                  <pre>{JSON.stringify(this.state.repliedThreads,null,2)}</pre>
                }
              />
            </div>
            <div>
              <div style={{display:'inline-block'}}>
                <TextInput 
                  label='Refresh Rate (sec)'
                  inputKey="refreshRate"
                  value={this.state.debugArgs.refreshRate}
                  validate={(value) => {
                    if (isNaN(value) || (parseInt(value, 10) != value)) {
                      return 'Not an integer';
                    }
        
                    if (value < 0) {
                      return 'Not a positive integer'
                    }
                  }}
                  onChange={(value, oldValue, inputKey, invalidMessage) => {
                    this.setDebugArgs('refreshRate', parseInt(value, 10));
                  }}
                />
        
                <ListInputField 
                  label="Comment List"
                  inputKey="comments"
                  value={this.state.debugArgs.comments}
                  defaultValue={'New comment'}
                  renderInputField={(value, onChange) => {
                    return (
                      <input 
                        type="text" 
                        className="form-control" 
                        value={value} 
                        onChange={(event) => {onChange(event.target.value);}}
                      />
                    );
                  }}
                  validate={(value) => {
                    if (value.replace(/\s/g,'') === '') {
                      return 'Comment cannot be blank';
                    }
        
                    if (value.length > 70) {
                      return 'Comment cannot exceed 70 characters';
                    }
                  }}
                  onChange={(value, oldValue, inputKey, invalidMessage) => {
                    this.setDebugArgs('comments', value);
                  }}
                />
              </div>
            </div>
          </div>
          <FieldDisplay
            label="Count Down"
            fieldDisplay={
              <div>{this.state.countdown ? this.state.countdown : 'N/A'}</div>
            }
          />
          <DebugControl
            onStart={() => {
              DoubanSofaUtils.startSofa(
                this.state.debugArgs, 
                function(secLeft) {
                  this.setState({countdown: secLeft});
                }.bind(this), 
                function(threadUrls){
                  var repliedThreads = this.state.repliedThreads;
                  
                  for (var i = 0; i < threadUrls.length; i++) {
                    var threadUrl = threadUrls[i];
                    if (!repliedThreads[threadUrl]) {
                      repliedThreads[threadUrl] = 0;
                    }
                    
                    repliedThreads[threadUrl]++;
                  }
                  this.setState({
                    repliedThreads: repliedThreads,
                  });
                }.bind(this)
              )
            }}
            onStop={() => {DoubanSofaUtils.stopSofa(function() {
                this.setState({countdown: null});
              }.bind(this));}}
          />
        </div>
      </div>
    );
  }
}

ReactDOM.render(<DebugNav />, document.getElementById('debug-nav'));
//# sourceURL=douban-sofa-machine.js
