import {useEffect, useMemo, useRef, useState} from "react";
import base_prompts from "./prompts.json";

const base_url = `${document.location.origin}/build/`;

/**
 * @typedef {Input_Type} Input_Type
 */

/**
 * @typedef {Prompt_Type} Prompt_Type
 */

/**
 * @typedef {Object} Variable
 * @property {Input_Type} type - The type of input
 * @property {string} search - The term to search for replace
 * @property {string} [title] - The displayed title (if not : "Insérez votre texte")
 * @property {number} [min] - The min for NUMBER or RANGE type
 * @property {number} [max] - The max for NUMBER or RANGE type
 * @property {number} [value] - The current value for RANGE type
 */

/**
 * @typedef {Object} Prompt
 * @property {Prompt_Type} type - The actual prompt type
 * @property {string} title - The prompt title
 * @property {string} prompt - The actual prompt
 * @property {string} display - Display title
 * @property {string} endpoint - Used endpoint
 * @property {string|Variable[]} variable - Variable name to replace with input
 * @property {Object} [headers] - Additional headers for request
 */

/**
 * Enum for input types
 * @readonly
 * @enum {string}
 */
export const Input_Type = Object.freeze( {
	TEXT: 'text',
	TEXTAREA: 'textarea',
	NUMBER: 'number',
	AUDIO: 'audio',
	RANGE: 'range'
} );

/**
 * Enum for prompts types
 * @readonly
 * @enum {string}
 */
export const Prompt_Type = Object.freeze({
	TEXT: 'text',
	FILE: 'file'
});

/**
 * The range input renderer
 * @param {Variable} variable - The current range variable with content
 * @param {string} random_name - The random generated code for this input
 * @return {any}
 */
export const RenderRangeInput = ({variable,random_name}) => {
	const [current,setCurrent] = useState(variable.value ?? variable.min ?? 0);
	const _handle_change = (e) => setCurrent(e.target.value);
	return (
		<>
			<div
				className="flex justify-between items-center"
			>
				<label
					htmlFor={random_name}
				>{variable.title ?? "Insérez votre audio"} :</label>
				<span>{current}/{variable.max ?? 100}</span>
			</div>
			<input
				className="clearable w-full block border border-[#deede6] p-2 rounded-md text-black"
				type="range"
				min={variable.min ?? 0}
				max={variable.max ?? 100}
				value={current}
				onChange={_handle_change}
				name={random_name}
				id={random_name}
				data-target={variable.search}
			></input>
		</>
	);
};

const App = () => {

	let base_prompts = require("./prompts.json");

	const [dark, setDark] = useState(false);
	const [prompts, setPrompts] = useState([]);
	const [prompt, setPrompt] = useState(base_prompts[0].title);
	const [result, setResult] = useState(null);

	const loader = useRef(null);
	const model = useRef(null);
	const buttonsRef = useRef(null);
	const choosePrompt = useRef(null);

	useEffect(() => {
		async function fetchPrompts() {
			try {
				const response = await fetch( `${base_url}/prompts.json` );
				if(! response.ok) {
					throw new Error(`HTTP error ! Status : ${response.status}`);
				}
				const data = await response.json();
				const result = resolve_types(data, {
					'Prompt_Type': Prompt_Type,
					'Input_Type': Input_Type
				});
				setPrompts([...result]);
			} catch (error) {
				console.error("New error : ", error);
			}
		}
		fetchPrompts();
	}, []);

	/**
	 * GPT KEY
	 * @type string
	 */
	const api_key = process.env.REACT_APP_GPT_KEY;
	/**
	 * GPT API URL
	 * @type string
	 */
	const api_url = "https://api.openai.com/v1";

	/**
	 * Resolve JSON custom types by enums
	 *
	 * @param {Object} json - The JSON input
	 * @param {Object} enums - Enums to search in
	 * @return {Object}
	 */
	const resolve_types = (json,enums) => {
		const action = i=>{
			if(typeof i.type === 'string'){
				for(const [prefix,enum_obj] of Object.entries(enums)){
					if(i.type.startsWith(prefix)){
						const type_key = i.type.split('.')[1];
						if(enum_obj[type_key]){
							i.type = enum_obj[type_key];
						}
					}
					if(Array.isArray(i.variable)){
						i.variable = resolve_types(i.variable,enums);
						break;
					}else{
						const type_key = i.type.split('.')[1];
						if(enum_obj[type_key]){
							i.type = enum_obj[type_key];
							break;
						}
					}
				}
			}
			return i;
		};
		return json.map(i=>action(i));
	};

	/**
	 * Render input for form
	 * @param {Variable} variable - The actual variable to render
	 */
	const render_input = variable => {
		let random_name = window.crypto.randomUUID();
		switch( variable.type ) {
			default:
			case Input_Type.TEXT:
				return (
					<>
						<label
							htmlFor={random_name}
						>{variable.title ?? "Insérez votre texte"} :</label>
						<input
							className="clearable w-full block border border-[#deede6] p-2 rounded-md text-black"
							name={random_name}
							id={random_name}
							data-target={variable.search}
						></input>
					</>
				);
			case Input_Type.TEXTAREA:
				return (
					<>
						<label
							htmlFor={random_name}
						>{variable.title ?? "Insérez votre texte"} :</label>
						<textarea
							className="clearable w-full block border border-[#deede6] p-2 rounded-md text-black"
							name={random_name}
							id={random_name}
							rows="10"
							data-target={variable.search}
						></textarea>
					</>
				);
			case Input_Type.NUMBER:
				return (
					<>
						<label
							htmlFor={random_name}
						>{variable.title ?? "Insérez votre audio"} :</label>
						<input
							className="clearable w-full block border border-[#deede6] p-2 rounded-md text-black"
							type="number"
							min={variable.min}
							max={variable.max}
							name={random_name}
							id={random_name}
							data-target={variable.search}
						></input>
					</>
				);
			case Input_Type.RANGE:
				return (
					<RenderRangeInput
						variable={variable}
						random_name={random_name}
					/>
				);
			case Input_Type.AUDIO:
				return (
					<>
						<label
							htmlFor={random_name}
						>{variable.title ?? "Insérez votre audio"} :</label>
						<input
							className="clearable w-full block border border-[#deede6] p-2 rounded-md text-black"
							type="file"
							accept=".mp3,.wav,.m4a"
							name={random_name}
							id={random_name}
							data-target={variable.search}
						></input>
					</>
				);
		}
	};

	/**
	 * Memoized GPT form to avoid multi rerender
	 * Depends on : dark mode, prompts, selected prompt
	 */
	const current_form = useMemo(() => {
		let current_prompt = prompts.filter(i => i.title === prompt) ?? prompts[0];
		if (
			Array.isArray(current_prompt) &&
			current_prompt.length !== 0
		) current_prompt = current_prompt[0];
		return (
			<>
				<div
					className="flex justify-between items-center w-full max-md:flex-col max-md:items-start"
				>
					<h1
						className="text-3xl font-medium"
					>{current_prompt.display}</h1>
					<button
						onClick={() => setDark(!dark)}
						className="text-white bg-[#6c757d] border border-[#6c757d] transition duration-150 hover:bg-[#5c636a] focus:bg-[#5c636a] px-2 py-1 w-fit h-fit rounded-md"
					>Mode Sombre
					</button>
				</div>
				<div
					className="w-full flex flex-col gap-2 items-center justify-start"
				>
					{
						Array.isArray(current_prompt.variable)
							? current_prompt.variable.map(i=>(
								<div
									className="w-full"
									key={window.crypto.randomUUID()}
								>
									{
										render_input(i)
									}
								</div>
							))
							: <div
								className="w-full"
							>
								<label
									htmlFor="text-inserted"
								>Insérez votre texte :</label>
								<textarea
									className="w-full block border border-[#deede6] p-2 rounded-md text-black"
									name="text-inserted"
									id="text-inserted"
									rows="10"
								></textarea>
							</div>
					}
					<div
						className="w-full"
					>
						<label
							htmlFor="select-gpt"
						>Sélectionnez la version de ChatGPT :</label>
						<select
							ref={model}
							className="w-full block border border-[#deede6] p-2 rounded-md text-black"
							name="select-gpt"
							id="select-gpt"
						>
							<option
								value="gpt-3.5-turbo"
							>GPT-3.5-turbo
							</option>
							<option
								value="gpt-4o"
							>GPT-4o
							</option>
						</select>
					</div>
				</div>
			</>
		);
	}, [dark,prompt,prompts]);

	/**
	 * Get GPT result for prompt with replaced content
	 * @param {string} url - Endpoint URL
	 * @param {string} model - Chosen GPT model
	 * @param {string} content - Content to send
	 * @param {Object} [headers] - Additional headers
	 * @return {Promise<any>}
	 */
	const fetch_result = async (url, model, content, headers= {}) => await fetch( api_url + url, {
		method: 'POST',
		headers: Object.assign({
			"Authorization": `Bearer ${api_key}`
		}, headers),
		body: JSON.stringify({
			model: model,
			messages: [{
				role: 'user',
				content: content
			}],
			temperature: 0.5,
			max_tokens: 4096,
			top_p: 1,
			frequency_penalty: 0,
			presence_penalty: 0
		})
	} ).then( response => response.json() ).catch( error => {
		alert("Une erreur est survenue. Regardez la console.");
		console.error( error );
	} );

	useEffect(() => {
		if (prompts.length === 0) {
			const result = resolve_types(base_prompts, {
				'Prompt_Type': Prompt_Type,
				'Input_Type': Input_Type
			});
			setPrompts([...base_prompts]);
		}
	}, [prompts]);

	return (
		<div
			className={
				"w-screen min-h-screen flex items-center justify-center py-10 " +
				(dark ? 'bg-[#343a40] text-[#f8f9fa]' : 'bg-[#f4f4f9] text-[#212529]')
			}
		>
			<div
				className={
					"w-2/3 h-fit relative rounded-lg shadow-lg px-6 py-4 flex flex-col gap-2 items-center transition duration-150 max-md:w-10/12 " +
					(dark ? 'bg-[#495057]' : 'bg-white')
				}
			>
				<div
					ref={loader}
					className="hidden w-full h-full absolute top-0 left-0 rounded-lg bg-gray-700/60 flex flex-col items-center justify-center"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeLinecap="round"
						strokeLinejoin="round"
						width="24"
						height="24"
						strokeWidth="2"
						className="animate-spin"
					>
						<path d="M12 3a9 9 0 1 0 9 9"></path>
					</svg>
					<span
						className="sr-only"
					>Chargement...</span>
				</div>
				<div
					ref={choosePrompt}
					className="w-full"
				>
					<label
						htmlFor="select-gpt"
					>Choix du prompt :</label>
					<select
						value={prompt}
						onChange={(e) => setPrompt(e.target.value)}
						className="w-full block border border-[#deede6] p-2 rounded-md text-black"
						name="select-gpt"
						id="select-gpt"
					>
						{
							prompts.map(i => (
								<option
									key={window.crypto.randomUUID()}
									value={i.title}
								>{i.display}</option>
							))
						}
					</select>
				</div>
				<hr
					className="h-0 w-full border-[#6c757d]/50"
				/>
				{
					result === null
						? current_form
						: <>
							<pre
								className="text-wrap w-full"
							>{result}</pre>
							<button
								onClick={()=>{
									navigator.clipboard.writeText(result);
									alert("Résultat copié.");
								}}
								className="text-white bg-[#6c757d] border border-[#6c757d] transition duration-150 hover:bg-[#5c636a] focus:bg-[#5c636a] px-2 py-1 w-fit h-fit rounded-md"
							>Copier le résultat
							</button>
						</>
				}
				<div
					ref={buttonsRef}
					className="flex justify-between items-center w-full max-md:flex-col max-md:items-start max-md:gap-2"
				>
					<button
						onClick={async () => {
							if (loader.current === null) return;
							loader.current.classList.remove('hidden');

							let selected_prompt = prompts.filter(i => i.title===prompt) ?? prompts[0];
							if(
								Array.isArray(selected_prompt) &&
								selected_prompt.length !== 0
							) selected_prompt = selected_prompt[0];
							if( selected_prompt.type === Prompt_Type.TEXT ) {
								let final_prompt = selected_prompt.prompt;
								[...document.querySelectorAll('.clearable')].map(i=>({
									search: i.dataset.target,
									value: i.value
								})).forEach(i=>final_prompt=final_prompt.replace(`[${i.search}]`,i.value));
								let result = await fetch_result(
									selected_prompt.endpoint,
									model.current.selectedOptions[0].value,
									final_prompt,
									selected_prompt.headers ?? {
										"Content-Type": "application/json"
									}
								);
								if(
									result === null ||
									result === undefined ||
									! result.hasOwnProperty( 'choices' ) ||
									! result.hasOwnProperty( 'id' ) ||
									! result.hasOwnProperty( 'model' )
								) {
									alert("Une erreur est survenue. Regardez la console.");
								} else {
									setResult(result.choices[0].message.content);
									loader.current.classList.add( 'hidden' );
									buttonsRef.current.classList.add( 'hidden' );
									choosePrompt.current.classList.add( 'hidden' );
								}
							} else if( selected_prompt.type === Prompt_Type.FILE ) {
								let audio_input = document.querySelector('input[type="file"].clearable');
								if(
									! audio_input.files ||
									audio_input.files.length === 0
								) {
									alert("Veuillez sélectionner un fichier audio pour continuer.");
									return;
								}
								const file = audio_input.files[0];
								const form_data = new FormData();
								form_data.append( 'file', file );
								form_data.append( 'model', 'whisper-1' );
								form_data.append( 'response_format', 'json' );
								try {
									const response = await fetch( api_url + selected_prompt.endpoint, {
										method: 'POST',
										headers: Object.assign({
											"Authorization": `Bearer ${api_key}`
										}),
										body: form_data
									} );
									if( ! response.ok ) {
										const error = await response.text();
										console.error( error );
										alert( "Une erreur est survenue lors de la retranscription." );
										return
									}
									const result = await response.json();
									if( result.text ) {
										setResult(result.text);
										loader.current.classList.add( 'hidden' );
										buttonsRef.current.classList.add( 'hidden' );
										choosePrompt.current.classList.add( 'hidden' );
									} else {
										alert( "Aucune retranscription possible." );
									}
								} catch (error) {
									alert("Une erreur est survenue lors de la retranscription.");
								}
							}
						}}
						className="text-white bg-[#0d6efd] border border-[#0d6efd] transition duration-150 hover:bg-[#0b5ed7] focus:bg-[#0b5ed7] px-2 py-1 w-fit h-fit rounded-md"
					>Soumettre
					</button>
					<button
						onClick={()=>[...document.querySelectorAll('.clearable')].forEach(i=>i.value='')}
						className="text-white bg-[#6c757d] border border-[#6c757d] transition duration-150 hover:bg-[#5c636a] focus:bg-[#5c636a] px-2 py-1 w-fit h-fit rounded-md"
					>Nouveau texte
					</button>
				</div>
		  </div>
	  </div>
	);

}

export default App;
