import { Refine, Authenticated } from "@refinedev/core";
import { ThemedLayoutV2, ThemedTitleV2, ErrorComponent, useNotificationProvider, AuthPage } from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";
import routerProvider, { NavigateToResource, CatchAllNavigate, UnsavedChangesNotifier, DocumentTitleHandler } from "@refinedev/react-router-v6";
import { dataProvider, liveProvider } from "@refinedev/supabase";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { ConfigProvider, App as AntdApp } from "antd";

import { supabaseClient } from "./supabaseClient";
import { authProvider } from "./authProvider";
import { accessControlProvider } from "./accessControlProvider";
import { i18nProvider } from "./i18nProvider";
import { raiTheme, RAI_GOLD } from "./theme";
import { OrgList, OrgCreate, OrgEdit } from "./pages/organizations";
import { RoleList, MembershipList } from "./pages/iam";

const iam = { schema: "iam" };

export function App() {
  return (
    <BrowserRouter>
      <ConfigProvider theme={raiTheme}>
        <AntdApp>
          <Refine
            dataProvider={dataProvider(supabaseClient)}
            liveProvider={liveProvider(supabaseClient)}
            authProvider={authProvider}
            accessControlProvider={accessControlProvider}
            i18nProvider={i18nProvider}
            routerProvider={routerProvider}
            notificationProvider={useNotificationProvider}
            resources={[
              { name: "organizations", list: "/organizations", create: "/organizations/create", edit: "/organizations/edit/:id", meta: { ...iam, label: "Tổ chức" } },
              { name: "roles", list: "/roles", meta: { ...iam, label: "Vai trò" } },
              { name: "memberships", list: "/memberships", meta: { ...iam, label: "Thành viên" } },
            ]}
            options={{ syncWithLocation: true, warnWhenUnsavedChanges: true, useNewQueryKeys: true, title: { text: "RAI Admin" } }}
          >
            <Routes>
              <Route
                element={
                  <Authenticated key="authed" fallback={<CatchAllNavigate to="/login" />}>
                    <ThemedLayoutV2 Title={({ collapsed }) => <ThemedTitleV2 collapsed={collapsed} text="RAI Admin" icon={<span style={{ color: RAI_GOLD, fontWeight: 700 }}>R</span>} />}>
                      <Outlet />
                    </ThemedLayoutV2>
                  </Authenticated>
                }
              >
                <Route index element={<NavigateToResource resource="organizations" />} />
                <Route path="/organizations">
                  <Route index element={<OrgList />} />
                  <Route path="create" element={<OrgCreate />} />
                  <Route path="edit/:id" element={<OrgEdit />} />
                </Route>
                <Route path="/roles" element={<RoleList />} />
                <Route path="/memberships" element={<MembershipList />} />
                <Route path="*" element={<ErrorComponent />} />
              </Route>

              <Route
                element={
                  <Authenticated key="guest" fallback={<Outlet />}>
                    <NavigateToResource resource="organizations" />
                  </Authenticated>
                }
              >
                <Route path="/login" element={<AuthPage type="login" registerLink={false} forgotPasswordLink={false} title="RAI Admin" />} />
              </Route>
            </Routes>

            <UnsavedChangesNotifier />
            <DocumentTitleHandler />
          </Refine>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  );
}
