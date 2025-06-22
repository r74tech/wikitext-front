import { nanoid } from "nanoid";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import MainContent from "./components/MainContent";
import { API_BASE_URL } from "./config/api";
import { useImportPreviewerData } from "./hooks/useImportPreviewerData";
import { HybridPageRepository } from "./infra/hybridPageRepository";
import { useAppDispatch } from "./store/hooks";
import { setPage, setRevisionCount, setShortId, setSource, setTitle } from "./store/pageSlice";
import { setUser } from "./store/userSlice";

function App() {
    const { shortId } = useParams<{ shortId?: string }>();
    const dispatch = useAppDispatch();

    useImportPreviewerData();

    useEffect(() => {
        const storedUserId = localStorage.getItem("userId");
        if (storedUserId) {
            dispatch(setUser({ userId: storedUserId, userName: storedUserId }));
        } else {
            const newUserId = nanoid();
            localStorage.setItem("userId", newUserId);
            dispatch(setUser({ userId: newUserId, userName: newUserId }));
        }
    }, [dispatch]);

    useEffect(() => {
        if (shortId) {
            const loadPage = async () => {
                const repository = new HybridPageRepository(
                    API_BASE_URL,
                    localStorage.getItem("userId") || "anonymous",
                );

                const result = await repository.findByShortId(shortId);

                if (result.isOk() && result.value) {
                    const page = result.value;

                    const shortIdValue = typeof page.shortId === "string" ? page.shortId : "";
                    const titleValue = typeof page.title === "string" ? page.title : "";
                    const sourceValue = typeof page.source === "string" ? page.source : "";

                    dispatch(setShortId(shortIdValue));
                    dispatch(setTitle(titleValue));
                    dispatch(setSource(sourceValue));
                    dispatch(setRevisionCount(page.revisionCount));
                } else {
                    window.location.href = "/";
                }
            };

            loadPage();
        } else {
            dispatch(
                setPage({
                    shortId: "",
                    title: "",
                    source: "",
                    html: "",
                    styles: [],
                    revisionCount: 0,
                }),
            );
        }
    }, [shortId, dispatch]);

    return (
        <>
            <div id="container-wrap-wrap">
                <div id="container-wrap">
                    <div id="container">
                        <Header />
                        <MainContent />
                        <Footer />
                    </div>
                </div>
            </div>
            <div id="extra-div-1">
                <span />
            </div>
            <div id="extra-div-2">
                <span />
            </div>
            <div id="extra-div-3">
                <span />
            </div>
            <div id="extra-div-4">
                <span />
            </div>
            <div id="extra-div-5">
                <span />
            </div>
            <div id="extra-div-6">
                <span />
            </div>
        </>
    );
}

export default App;
