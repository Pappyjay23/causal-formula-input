import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import FormulaInput from "./components/FormulaInput";

const queryClient = new QueryClient();

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<div className="h-[100dvh] flex items-center bg-black text-white">
				<div className='w-[80%] lg:w-[40%] mx-auto p-4'>
					<h1 className='text-2xl text-center font-bold mb-4'>Causal Formula Input</h1>
					<FormulaInput />
				</div>
			</div>
		</QueryClientProvider>
	);
}

export default App;
