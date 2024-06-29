import { useState } from 'react'
import './App.css'
import OpenAI from 'openai';
import SelectPrompt from './components/SelectPrompt';
import Editor from './components/Editor'
import Diff from './components/Diff2';
import Select from 'react-select'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import CreatableSelect from 'react-select/creatable';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
// import Select from 'react-select/dist/declarations/src/Select';
import defaultPrompts from './components/defaultPrompts'


const model_options = [
  // https://platform.openai.com/docs/models/continuous-model-upgrades
  'gpt-3.5-turbo',
  'gpt-4',
  'gpt-4-turbo',
  // 'text-moderation-stable',
  'GPT-4o', 
].map((model) => ({ value: model, label: model }))

function configureOpenAI() {
  return new OpenAI({
    apiKey: localStorage.getItem('OPENAI_KEY'),
    baseURL: localStorage.getItem('OPENAI_BASE_URL'),
    dangerouslyAllowBrowser: true,
  });
}
let openai = configureOpenAI()

function handleOpenAIKey(key, callback) {
  localStorage.setItem('OPENAI_KEY', key)
  openai = configureOpenAI()
  if (callback) { callback(key) }
}

function handleOpenAIURL(key, callback) {
  localStorage.setItem('OPENAI_BASE_URL', key)
  openai = configureOpenAI()
  if (callback) { callback(key) }
}

function handleOpenTemp(key, callback) {
  localStorage.setItem('OPENAI_TEMP', key)
  openai = configureOpenAI()
  if (callback) { callback(key) }
}


function WrappedDiff({ type, inputA, inputB }) {
  return <div>
    <h4>{type}</h4>
    <Diff
      inputA={inputA}
      inputB={inputB} />
  </div>
}


function sendMessage(model, prompt, input, callback, onStatus) {
  const content = `### Instructions
${prompt}  
### Draft
${input}`
  console.debug("sending" + content);
  onStatus({ status: "Loading" })
  // https://github.com/openai/openai-node/blob/master/src/resources/chat/completions.ts#L796C3-L796C14
  const chatCompletion = openai.chat.completions.create({
    messages: [{ role: 'user', content: content }],
    model: model,
    temperature: parseFloat(localStorage.getItem('OPENAI_TEMP', 1)),
  });
  chatCompletion.then((m) => {
    console.debug(m)
    callback(m['choices'][0]['message']['content'])
    onStatus({})
  }).catch(async (err) => {
    if (err instanceof OpenAI.APIError) {
      console.log(err.status); // 400
      console.log(err.name); // BadRequestError
      console.log(err.headers); // {server: 'nginx', ...}
      if (onStatus) { onStatus({ error: `${err.status}: ${err.message}` }) }
    } else {
      onStatus({ error: JSON.stringify(err) })
      throw err;
    }
  });

}


function Progress({ data }) {
  if (!data) {
    return null;
  }
  const { status, error, loading } = data

  if (status) {
    return <Alert variant="info">{status}</Alert>
  }
  if (!error || error === null) {
    return null;
  }
  return <Alert variant="warning">Error: {error}
  </Alert>
}


function App() {
  const [count, setCount] = useState(0)
  const [input, setInput] = useState(`The missil know where it is at all time. It knows this because it knows where it isnt. By subtracting where it si from where it isn't, or where it isn't from where it is (whichever is greater), it obtain a difference, or deviation. The guidance ssystem uses deviations to generate corrective commands to drive ta missile from a posi where it is to a position where it isn't, and arriving at there position where it wasn't, it now is. Consequently, the position where it is, is now the position that it wasn't, and it follow that the position that it was, is now the position that it isnt.`)
  const [prompt, setPrompt] = useState(defaultPrompts[0])
  const [reply, setReply] = useState(`The missile knows where it is at all times. It knows this because it knows where it isn't. By subtracting where it is from where it isn't, or where it isn't from where it is (whichever is greater), it obtains a difference or deviation. The guidance system uses deviations to generate corrective commands to drive the missile from a position where it is to a position where it isn't. On arriving at the position where it wasn't, it now is. Consequently, the position where it is, is now the position that it wasn't, and it follows that the position that it was, is now the position that it isn't.`)
  const [OPENAI_KEY, setOPENAIKey] = useState(localStorage.getItem('OPENAI_KEY'))
  const [OPENAIBASE_URL, setOPENAIURL] = useState(localStorage.getItem('OPENAI_BASE_URL'))
  const [status, setStatus] = useState(null)
  const [openaiModel, setOpenAIModel] = useState('gpt-3.5-turbo')
  const [Temperature, setOPENAITEMP] = useState(1.0)



  return (
    <Container>
      <Row>
        <Col sm={4}>
          <Row>

            <SelectPrompt value={prompt} onChange={setPrompt} />
          </Row><Row>


            <Form>
              <FloatingLabel label="OPENAI_KEY:"
              >
                <Form.Control
                  type="password"
                  value={OPENAI_KEY}
                  onChange={(s) => handleOpenAIKey(s.target.value, setOPENAIKey)}
                  required
                /></FloatingLabel>
            </Form>
          </Row><Row>
            <Form>
              <FloatingLabel label="BASE_URL:"
              >
                <Form.Control
                  type="text"
                  value={OPENAIBASE_URL}
                  onChange={(s) => handleOpenAIURL(s.target.value, setOPENAIURL)}
                /></FloatingLabel>
            </Form>

          </Row><Row>

            <Form>
              <Form.Label>OPENAI_MODEL:</Form.Label>
              {/* <Form.Control
                type="text"
                value={openaiModel}
                onChange={(s) => setOpenAIModel(s.target.value)}
                required
                /> */}
              <CreatableSelect
                options={model_options}
                creatable={true}
                defaultValue={model_options[0]}
                onChange={(s) => setOpenAIModel(s.label)}
                required
              />

            </Form>
          </Row><Row>
            <Form>
              <FloatingLabel label="Temperature:">
                <Form.Control
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={Temperature}
                  onChange={(s) => handleOpenTemp(s.target.value, setOPENAITEMP)}
                /></FloatingLabel>
            </Form>


          </Row>


        </Col>
        <Col sm={8}>
          <Row>
            <Form onSubmit={e => e.preventDefault()}>
              <Editor name="Input" value={input} onChange={(e) => setInput(e.target.value)} />
              <Button
                variant="primary"
                onClick={() => setCount(() => sendMessage(openaiModel, prompt, input, setReply, setStatus))}>
                Submit
              </Button>
              <Progress data={status} />
            </Form>
          </Row>
          <Row>
            <Form>
              <Editor name="Reply" value={reply} onChange={(e) => setReply(e.target.value)} />
            </Form>
          </Row>
          <Row>
            <WrappedDiff type="Diff" inputA={input} inputB={reply} />
          </Row>
        </Col>
      </Row>
    </Container>
  )
}

export default App
