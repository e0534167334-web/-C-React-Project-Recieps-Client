import { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { AdminRoute } from "./routes/AdminRoute";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { HomePage } from "./pages/HomePage";

const RecipePage = lazy(() => import("./pages/RecipePage").then((m) => ({ default: m.RecipePage })));
const ForumPage = lazy(() => import("./pages/ForumPage").then((m) => ({ default: m.ForumPage })));
const LoginPage = lazy(() => import("./pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("./pages/RegisterPage").then((m) => ({ default: m.RegisterPage })));
const RecipeFormPage = lazy(() => import("./pages/RecipeFormPage").then((m) => ({ default: m.RecipeFormPage })));
const MyRecipesPage = lazy(() => import("./pages/MyRecipesPage").then((m) => ({ default: m.MyRecipesPage })));
const CookbookPage = lazy(() => import("./pages/CookbookPage").then((m) => ({ default: m.CookbookPage })));
const QuestionFormPage = lazy(() => import("./pages/QuestionFormPage").then((m) => ({ default: m.QuestionFormPage })));
const ProfilePage = lazy(() => import("./pages/ProfilePage").then((m) => ({ default: m.ProfilePage })));
const AdminPendingPage = lazy(() => import("./pages/AdminPendingPage").then((m) => ({ default: m.AdminPendingPage })));
const AdminCategoriesPage = lazy(() => import("./pages/AdminCategoriesPage").then((m) => ({ default: m.AdminCategoriesPage })));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })));

function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="recipes/:id" element={<RecipePage />} />
                <Route path="forum" element={<ForumPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="recipes/new" element={<RecipeFormPage />} />
                    <Route path="recipes/:id/edit" element={<RecipeFormPage />} />
                    <Route path="my-recipes" element={<MyRecipesPage />} />
                    <Route path="cookbook" element={<CookbookPage />} />
                    <Route path="forum/new" element={<QuestionFormPage />} />
                    <Route path="forum/:id/edit" element={<QuestionFormPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                </Route>

                <Route element={<AdminRoute />}>
                    <Route path="admin/pending" element={<AdminPendingPage />} />
                    <Route path="admin/categories" element={<AdminCategoriesPage />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
}

export default App;
