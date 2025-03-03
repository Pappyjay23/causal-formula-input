import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFormulaStore } from "../store/formulaStore";
import {
	fetchAutocompleteSuggestions,
	AutocompleteItem,
} from "../api/autocomplete";
import { MdRemove, MdAttachMoney, MdFunctions } from "react-icons/md";

interface Tag {
	id: string;
	name: string;
	value: number | string;
}

const FormulaInput: React.FC = () => {
	const [inputValue, setInputValue] = useState("");
	const [displayValue, setDisplayValue] = useState("");
	const [tags, setTags] = useState<Tag[]>([]);
	const [cursorPosition, setCursorPosition] = useState(0);
	const [isFocused, setIsFocused] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const { setFormula } = useFormulaStore();

	const currentWord = inputValue.split(/[-+*/()^]/).pop() || "";

	const { data: suggestions } = useQuery({
		queryKey: ["autocomplete", currentWord],
		queryFn: () => fetchAutocompleteSuggestions(currentWord),
		enabled: currentWord.length > 0 && isFocused,
	});

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
		setCursorPosition(e.target.selectionStart || 0);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			calculateResult();
		} else if (e.key === "Backspace") {
			const newCursorPosition = cursorPosition - 1;
			if (inputValue[newCursorPosition] === "]") {
				e.preventDefault();
				const openBracketIndex = inputValue.lastIndexOf("[", newCursorPosition);
				if (openBracketIndex !== -1) {
					const newInputValue =
						inputValue.slice(0, openBracketIndex) +
						inputValue.slice(cursorPosition);
					setInputValue(newInputValue);
					setCursorPosition(openBracketIndex);
				}
			}
		}
	};

	const insertTag = (item: AutocompleteItem) => {
		const newTag = { id: item.id, name: item.name, value: item.value };
		const tagText = `[${item.name}]`;
		const newInputValue =
			inputValue.slice(0, cursorPosition - currentWord.length) +
			tagText +
			inputValue.slice(cursorPosition);

		setTags([...tags, newTag]);
		setInputValue(newInputValue);
		setCursorPosition(cursorPosition - currentWord.length + tagText.length);
	};

	const calculateResult = () => {
		let formula = inputValue;
		tags.forEach((tag) => {
			const regex = new RegExp(`\\[${tag.name}\\]`, "g");
			formula = formula.replace(regex, tag.value.toString());
		});
		try {
			const result = new Function(`return ${formula}`)();
			setDisplayValue(`${result}`); // Only set the result, not the full equation
			setFormula(`${inputValue} = ${result}`);
			console.log("Formula result:", result);
		} catch (error) {
			console.error("Error evaluating formula:", error);
			setDisplayValue(inputValue);
			setFormula(inputValue);
		}
		setIsFocused(false);
	};

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
		}
	}, [cursorPosition]);

	const renderInputWithTags = () => {
		if (!isFocused && displayValue) {
			return displayValue; // When not focused and there's a result, just show the result
		}
		const parts = inputValue.split(/(\[[^\]]+\])/);
		return parts.map((part, index) => {
			if (part.startsWith("[") && part.endsWith("]")) {
				const tagName = part.slice(1, -1);
				return (
					<span
						key={index}
						className='inline-flex items-center px-2 py-1 mr-1 text-sm font-medium text-blue-700 bg-blue-100 rounded'>
						{tagName}
					</span>
				);
			}
			return part;
		});
	};

	const handleFocus = () => {
		setIsFocused(true);
		if (displayValue && displayValue !== inputValue) {
			setInputValue(inputValue || displayValue.split("=")[0].trim());
		}
		setDisplayValue("");
	};

	return (
		<div className='relative w-full'>
			<div className='relative flex items-center w-full border border-gray-200 rounded-md hover:border-gray-300 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500'>
				<span className='flex items-center justify-center w-8 text-gray-400'>
					<MdRemove size={16} />
				</span>
				<div
					className='flex-grow px-2 py-2 bg-transparent outline-none min-h-[44px] cursor-text'
					onClick={() => {
						inputRef.current?.focus();
						handleFocus();
					}}>
					{renderInputWithTags()}
					<input
						ref={inputRef}
						type='text'
						value={isFocused ? inputValue : displayValue}
						onChange={handleInputChange}
						onKeyDown={handleKeyDown}
						onFocus={handleFocus}
						onBlur={() => setTimeout(() => setIsFocused(false), 200)}
						className='absolute top-0 left-0 w-full h-full opacity-0'
					/>
				</div>
				<span className='flex items-center justify-center w-8'>
					<div className='w-2 h-2 rounded-full bg-purple-500' />
				</span>
			</div>

			{isFocused && suggestions && suggestions.length > 0 && (
				<div className='absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg'>
					{suggestions.map((item: AutocompleteItem, index: number) => (
						<div
							key={`${item.id}-${index}`}
							className='flex items-start px-3 py-2 hover:bg-gray-50 cursor-pointer'
							onClick={() => insertTag(item)}>
							<span className='flex items-center justify-center w-6 h-6 mr-2 text-gray-500'>
								{item.category === "function" ? (
									<MdFunctions size={16} />
								) : (
									<MdAttachMoney size={16} />
								)}
							</span>
							<div className='flex-1'>
								<div className='font-medium text-gray-900'>{item.name}</div>
								{item.description && (
									<div className='text-sm text-gray-500'>
										{item.description}
									</div>
								)}
								{item.category && item.category !== "function" && (
									<div className='text-xs text-gray-400'>• {item.category}</div>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default FormulaInput;
