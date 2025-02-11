# Simple GPT Prompts interface

**This project, initially conceived on a modest scale, has seen significant expansion due to successive additions. Due to lack of time, I was unable to rework the code to adapt it to this new scale.**

This project allow you to run GPT prompts with parameters.\
Feel free to fork this repository, many functionalities can be added.

## Perplexity
This project allow [Perplexity AI](https://www.perplexity.ai/) integration.\
By default, using `sonar` model and [default values for a chat completion request](https://docs.perplexity.ai/api-reference/chat-completions).

## Mistral AI
This project allow [Mistral AI](https://mistral.ai/) integration.\
By default, using `mistral-tiny` model.

## Homepage

Remember to edit the `package.json` file to [change the `homepage` entry !](https://create-react-app.dev/docs/deployment/#building-for-relative-paths)

## Add or edit prompts

__After build,__ you need to edit the file `prompts.json` to add or edit existing prompts.

### Edit

Simply edit the prompt.\
To add more variables, please refer to the __Add__ section.

### Add

You can add prompts that fetch text or audio file.\
Here is the definition of a Prompt :

| JSON Object Entry  | Description                                                                                                    | Available                                                                                                          | Required |
|--------------------|----------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|----------|
| display            | The name actually displayed                                                                                    | string                                                                                                             | Yes      |
| type               | Type of prompt (text or audio )                                                                                | `Prompt_Type.TEXT` OR `Prompt_Type.FILE`                                                                           | Yes      |
| title              | Unique identifier of the prompt                                                                                | string                                                                                                             | Yes      |
| endpoint           | The GPT endpoint where prompt will be sent                                                                     | string                                                                                                             | Yes      |
| prompt             | [The actual prompt, with variables](#gpt-prompts-variables)                                                    | string                                                                                                             | Yes      |
| variable           | Array of variables for the prompt                                                                              | Variable[]                                                                                                         | Yes      |
| headers            | Add some headers to the request                                                                                | Object [_(same as fetch)_](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#setting_headers) | No       |
| perplexity         | Allow using Perplexity with this prompt                                                                        | boolean _(true/false)_                                                                                             | No       |
| perplexity_prompt  | The prompt used for perplexity                                                                                 | string                                                                                                             | No       |
| perplexity_model   | The Perplexity model used by the prompt                                                                        | string _(default: "sonar")_                                                                                        | No       | 
| mistral            | Allow using Mistral AI with this prompt                                                                        | boolean _(true/false)_                                                                                             | No       |
| mistral_prompt     | The Prompt used for Mistral AI                                                                                 | string                                                                                                             | No       |
| mistral_model      | The [Mistral AI](https://docs.mistral.ai/getting-started/models/models_overview/) model used for this prompt   | string _(default: "mistral-tiny")_                                                                                 | No       |

<a name="gpt-prompts-variables"></a>
### Prompt's variables

Before the prompt is sent to GPT, the interface will replace every variable's `search` entry by the user input.\
Here is the definition of a Variable :

| JSON Object Entry | Description                                                      | Available                                  | Required |
|-------------------|------------------------------------------------------------------|--------------------------------------------|----------|
| search            | What is searched in the prompt to remplace with user's data      | string                                     | Yes      |
| type              | Type of input to render for user input                           | [The input type](#gpt-prompts-input-types) | Yes      |
| title             | Label of the input                                               | string                                     | No       |
| min               | FOR `Input_Type.NUMBER` AND `Input_Type.RANGE`, min of the input | number                                     | No       |
| max               | FOR `Input_Type.NUMBER` AND `Input_Type.RANGE`, max of the input | number                                     | No       |
| value             | FOR `Input_Type.RANGE`, default value of input                   | number                                     | No       |
| from_result       | Replace the variable with perplexity's result to send to GPT     | boolean                                    | No       |

<a name="gpt-prompts-input-types"></a>
### Input Types
| Name                  | Description                                         |
|-----------------------|-----------------------------------------------------|
| `Input_Type.TEXT`     | Input of type text (single line)                    |
| `Input_Type.TEXTAREA` | Textarea for bigger text                            |
| `Input_Type.NUMBER`   | Input of type number                                |
| `Input_Type.RANGE`    | Range \[0;100] OR \[min;max]                        |
| `Input_Type.AUDIO`    | Predefined upload file button for audio recognizion |

## Build the interface

To correctly build the interface, you will need to create the file ".env.local" at project's root.\
This file will contain your OpenAI's API key, like the following :
```
REACT_APP_GPT_KEY=YOUR-KEY-HERE
REACT_APP_PERPLEXITY_KEY=YOUR-KEY-HERE
REACT_APP_MISTRAL_KEY=YOUR-KEY-HERE
```

The `dotenv` library will hardcode that to the interface.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed !

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
