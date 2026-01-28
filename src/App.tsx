import { useState, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppCartProvider } from "@/contexts/AppCartContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppCartBubble } from "@/components/AppCartBubble";
import { AppCartDrawer } from "@/components/AppCartDrawer";
import { MobileToolNav } from "@/components/MobileToolNav";
import { DesktopToolNav } from "@/components/DesktopToolNav";
import { OfflineBanner } from "@/components/OfflineBanner";
import { RequireAuth } from "@/components/RequireAuth";
const Admin3MSwatchGenerator = lazy(() => import("@/pages/Admin3MSwatchGenerator"));
const AdminAverySwatchGenerator = lazy(() => import("@/pages/AdminAverySwatchGenerator"));
const Admin3MSwatchManager = lazy(() => import("@/pages/Admin3MSwatchManager"));
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import GraphicsPro from "./pages/GraphicsPro";
import ColorPro from "./pages/ColorPro";
import DesignPro from "./pages/DesignPro";
import FadeWraps from "./pages/FadeWraps";
import WBTY from "./pages/WBTY";
import ApproveMode from "./pages/ApproveMode";
import Visualize from "./pages/Visualize";
import DesignProAISuite from "./pages/DesignProAISuite";
import MaterialMode from "./pages/MaterialMode";
import AdminRenders from "./pages/AdminRenders";
import AdminRestylepro from "./pages/AdminRestylepro";
import AdminCarouselManager from "./pages/AdminCarouselManager";
import AdminDashboard from "./pages/AdminDashboard";
import AdminInkFusionManager from "./pages/AdminInkFusionManager";
import AdminWBTYManager from "./pages/AdminWBTYManager";
import AdminApproveProManager from "./pages/AdminApproveProManager";
import AdminFadeWrapsManager from "./pages/AdminFadeWrapsManager";
import AdminRenderCarousel from "./pages/AdminRenderCarousel";
import AdminSwatchCleaner from "./pages/AdminSwatchCleaner";
const AdminSwatchMapper = lazy(() => import("./pages/AdminSwatchMapper"));
import AdminGallery from "./pages/AdminGallery";
import AdminDesignPanelProManager from "./pages/AdminDesignPanelProManager";
import AdminProductionPacks from "./pages/AdminProductionPacks";
import AdminColorProManager from "./pages/AdminColorProManager";
import AdminHeroCarousel from "./pages/AdminHeroCarousel";
import AdminLogin from "./pages/AdminLogin";
import AdminQualityReview from "./pages/AdminQualityReview";
import AdminShowcaseManager from "./pages/AdminShowcaseManager";
import AdminSubscriptions from "./pages/AdminSubscriptions";
import AdminAIAutoFix from "./pages/AdminAIAutoFix";
import AdminWaitlist from "./pages/AdminWaitlist";
import AdminBilling from "./pages/AdminBilling";
import AdminRenderUpload from "./pages/AdminRenderUpload";
import AdminGalleryManager from "./pages/AdminGalleryManager";
import Gallery from "./pages/Gallery";
import PrintPro from "./pages/PrintPro";
import InkFusionProductPage from "./components/printpro/InkFusionProductPage";
import WBTYPrintedProductPage from "./components/printpro/WBTYPrintedProductPage";
import DesignPanelProPrintedProductPage from "./components/printpro/DesignPanelProPrintedProductPage";
import FadeWrapPrintedProductPage from "./components/printpro/FadeWrapPrintedProductPage";
import PrintableReflectiveProductPage from "./components/printpro/PrintableReflectiveProductPage";
import FullDesignPrintPacksProductPage from "./components/printpro/FullDesignPrintPacksProductPage";
import CustomPrintUploadProductPage from "./components/printpro/CustomPrintUploadProductPage";
import MyRenders from "./pages/MyRenders";
import MyDesigns from "./pages/MyDesigns";
import ShareDesign from "./pages/ShareDesign";
import UserGuide from "./pages/UserGuide";
import Pricing from "./pages/Pricing";
import AppCart from "./pages/AppCart";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import ResetPasswordRequest from "./pages/ResetPasswordRequest";
import ResetPassword from "./pages/ResetPassword";
import FAQ from "./pages/FAQ";
import Billing from "./pages/Billing";
import DownloadSuccess from "./pages/DownloadSuccess";
import FleetServices from "./pages/FleetServices";
import AdminSendInvites from "./pages/AdminSendInvites";
import TesterWelcome from "./pages/TesterWelcome";
import AdminHeroRenderPicker from "./pages/AdminHeroRenderPicker";
import AdminEnrichSwatches from "./pages/AdminEnrichSwatches";
import AdminSwatchUrlUpdater from "./pages/AdminSwatchUrlUpdater";
const AdminSwatchValidation = lazy(() => import("./pages/AdminSwatchValidation"));
const AdminInkFusionSampleChart = lazy(() => import("./pages/AdminInkFusionSampleChart"));
const AdminShopSettings = lazy(() => import("./pages/AdminShopSettings"));
const AdminMightyMail = lazy(() => import("./pages/AdminMightyMail"));
const AdminSwatchQA = lazy(() => import("./pages/AdminSwatchQA"));
const AdminLABMonitor = lazy(() => import("./pages/AdminLABMonitor"));
const AdminSwatchExtractor = lazy(() => import("./pages/AdminSwatchExtractor"));
const AdminManufacturerColors = lazy(() => import("./pages/AdminManufacturerColors"));
const AdminColorAudit = lazy(() => import("./pages/AdminColorAudit"));
const AdminConversionDashboard = lazy(() => import("./pages/AdminConversionDashboard"));

const queryClient = new QueryClient();

const App = () => {
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppCartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
          <BrowserRouter>
            <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/colorpro" element={<RequireAuth><ColorPro /></RequireAuth>} />
          <Route path="/graphicspro" element={<RequireAuth><GraphicsPro /></RequireAuth>} />
          <Route path="/inkfusion" element={<Navigate to="/colorpro" replace />} />
          <Route path="/designpro" element={<RequireAuth><DesignPro /></RequireAuth>} />
          <Route path="/fadewraps" element={<RequireAuth><FadeWraps /></RequireAuth>} />
          <Route path="/designpanelpro" element={<Navigate to="/designpro" replace />} />
          <Route path="/wbty" element={<RequireAuth><WBTY /></RequireAuth>} />
          <Route path="/approvemode" element={<RequireAuth><ApproveMode /></RequireAuth>} />
          <Route path="/tools" element={<DesignProAISuite />} />
          <Route path="/visualize" element={<RequireAuth><Visualize /></RequireAuth>} />
          <Route path="/material" element={<RequireAuth><MaterialMode /></RequireAuth>} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/renders" element={<AdminRenders />} />
          <Route path="/admin-restylepro" element={<AdminRestylepro />} />
          <Route path="/admin/shop-settings" element={<Suspense fallback={<div>Loading...</div>}><AdminShopSettings /></Suspense>} />
          <Route path="/admin/carousel" element={<AdminCarouselManager />} />
          <Route path="/admin/inkfusion-manager" element={<AdminInkFusionManager />} />
          <Route path="/admin/wbty-manager" element={<AdminWBTYManager />} />
          <Route path="/admin/fadewraps-manager" element={<AdminFadeWrapsManager />} />
          <Route path="/admin/designpanelpro-manager" element={<AdminDesignPanelProManager />} />
          <Route path="/admin/production-packs" element={<AdminProductionPacks />} />
          <Route path="/admin/render-carousel" element={<AdminRenderCarousel />} />
          <Route path="/admin/swatch-cleaner" element={<AdminSwatchCleaner />} />
          <Route path="/admin/swatch-mapper" element={
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
              <AdminSwatchMapper />
            </Suspense>
          } />
          <Route path="/admin/gallery" element={<AdminGallery />} />
          <Route path="/admin/hero-carousel" element={<AdminHeroCarousel />} />
          <Route path="/admin/colorpro-manager" element={<AdminColorProManager />} />
          <Route path="/admin/showcase-manager" element={<AdminShowcaseManager />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/quality-review" element={<AdminQualityReview />} />
          <Route path="/admin/ai-auto-fix" element={<AdminAIAutoFix />} />
          <Route path="/admin/3m-swatch-generator" element={
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
              <Admin3MSwatchGenerator />
            </Suspense>
          } />
          <Route path="/admin/avery-swatch-generator" element={
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
              <AdminAverySwatchGenerator />
            </Suspense>
          } />
          <Route path="/admin/wbty" element={<AdminWBTYManager />} />
          <Route path="/admin/approvemode" element={<AdminApproveProManager />} />
          <Route path="/admin/swatches" element={
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
              <Admin3MSwatchManager />
            </Suspense>
          } />
          <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
          <Route path="/admin/waitlist" element={<AdminWaitlist />} />
          <Route path="/admin/billing" element={<AdminBilling />} />
          <Route path="/admin/render-upload" element={<AdminRenderUpload />} />
          <Route path="/admin/gallery-manager" element={<AdminGalleryManager />} />
          <Route path="/admin/send-invites" element={<AdminSendInvites />} />
          <Route path="/admin/hero-render-picker" element={<AdminHeroRenderPicker />} />
          <Route path="/admin/enrich-swatches" element={<AdminEnrichSwatches />} />
          <Route path="/admin/swatch-url-updater" element={<AdminSwatchUrlUpdater />} />
          <Route path="/admin/swatch-validation" element={
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
              <AdminSwatchValidation />
            </Suspense>
          } />
          <Route path="/admin/inkfusion-sample-chart" element={
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
              <AdminInkFusionSampleChart />
            </Suspense>
          } />
          <Route path="/admin/mightymail" element={
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
              <AdminMightyMail />
            </Suspense>
          } />
          <Route path="/admin/swatch-qa" element={
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
              <AdminSwatchQA />
            </Suspense>
          } />
          <Route path="/admin/lab-monitor" element={
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
              <AdminLABMonitor />
            </Suspense>
          } />
          <Route path="/admin/swatch-extractor" element={
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
              <AdminSwatchExtractor />
            </Suspense>
          } />
          <Route path="/admin/manufacturer-colors" element={
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
              <AdminManufacturerColors />
            </Suspense>
          } />
          <Route path="/admin/color-audit" element={
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
              <AdminColorAudit />
            </Suspense>
          } />
          <Route path="/admin/conversion-dashboard" element={
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
              <AdminConversionDashboard />
            </Suspense>
          } />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/printpro" element={<RequireAuth><PrintPro /></RequireAuth>} />
          <Route path="/printpro/inkfusion" element={<RequireAuth><InkFusionProductPage /></RequireAuth>} />
          <Route path="/printpro/wbty" element={<RequireAuth><WBTYPrintedProductPage /></RequireAuth>} />
          <Route path="/printpro/designpanelpro" element={<RequireAuth><DesignPanelProPrintedProductPage /></RequireAuth>} />
          <Route path="/printpro/fadewrap" element={<RequireAuth><FadeWrapPrintedProductPage /></RequireAuth>} />
          <Route path="/printpro/reflective" element={<RequireAuth><PrintableReflectiveProductPage /></RequireAuth>} />
          <Route path="/printpro/design-packs" element={<RequireAuth><FullDesignPrintPacksProductPage /></RequireAuth>} />
          <Route path="/printpro/custom-upload" element={<RequireAuth><CustomPrintUploadProductPage /></RequireAuth>} />
          <Route path="/my-renders" element={<RequireAuth><MyRenders /></RequireAuth>} />
          <Route path="/my-designs" element={<RequireAuth><MyDesigns /></RequireAuth>} />
          <Route path="/user-guide" element={<UserGuide />} />
          <Route path="/pricing" element={<RequireAuth><Pricing /></RequireAuth>} />
          <Route path="/billing" element={<RequireAuth><Billing /></RequireAuth>} />
          <Route path="/app-cart" element={<RequireAuth><AppCart /></RequireAuth>} />
          <Route path="/download-success" element={<DownloadSuccess />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/reset-password-request" element={<ResetPasswordRequest />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth" element={<Navigate to="/login" replace />} />
          <Route path="/fleet" element={<FleetServices />} />
          <Route path="/tester-welcome" element={<TesterWelcome />} />
          <Route path="/share/:type/:id" element={<ShareDesign />} />
          <Route path="/faq" element={<FAQ />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <AppCartBubble onClick={() => setIsCartDrawerOpen(true)} />
        <AppCartDrawer isOpen={isCartDrawerOpen} onClose={() => setIsCartDrawerOpen(false)} />
          <MobileToolNav />
          <DesktopToolNav />
          <OfflineBanner />
        </BrowserRouter>
      </TooltipProvider>
    </AppCartProvider>
  </ThemeProvider>
</QueryClientProvider>
  );
};

export default App;
