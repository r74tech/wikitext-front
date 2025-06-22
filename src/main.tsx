import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App.tsx";
import { store } from "./store";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("container-wrap-wrap") as HTMLElement).render(
	<StrictMode>
		<Provider store={store}>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<App />} />
					<Route path="/share/:shortId" element={<App />} />
					<Route path="*" element={<App />} />
				</Routes>
			</BrowserRouter>
		</Provider>
	</StrictMode>,
);
