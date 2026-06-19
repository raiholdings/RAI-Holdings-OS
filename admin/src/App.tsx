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
import { Dashboard } from "./pages/dashboard";
import { AiConsole } from "./pages/ai";
import { VentureList, VentureEdit, VentureShow } from "./pages/ventures";
import { WsOrgList, WsOrgEdit, WsMemberList, TxnList, UsageList } from "./pages/workspace";
import { OrgList, OrgCreate, OrgEdit } from "./pages/organizations";
import { RoleList, MembershipList } from "./pages/iam";

const iam = { schema: "iam" };
const ws = { schema: "workspace" };

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
              { name: "dashboard", list: "/", meta: { label: "Tổng quan" } },
              { name: "ai", list: "/ai", meta: { label: "AI điều khiển" } },

              { name: "workspace_grp", meta: { label: "Workspace" } },
              { name: "ventures", list: "/ventures", edit: "/ventures/edit/:id", show: "/ventures/show/:id", meta: { ...ws, parent: "workspace_grp", label: "Doanh nghiệp", canDelete: true } },
              { name: "orgs", list: "/workspace/orgs", edit: "/workspace/orgs/edit/:id", meta: { ...ws, parent: "workspace_grp", label: "Tổ chức & ví" } },
              { name: "org_members", list: "/workspace/members", meta: { ...ws, parent: "workspace_grp", label: "Thành viên" } },
              { name: "wallet_txns", list: "/workspace/wallet", meta: { ...ws, parent: "workspace_grp", label: "Giao dịch ví" } },
              { name: "usage_events", list: "/workspace/usage", meta: { ...ws, parent: "workspace_grp", label: "Sử dụng" } },

              { name: "iam_grp", meta: { label: "IAM" } },
              { name: "organizations", list: "/iam/organizations", create: "/iam/organizations/create", edit: "/iam/organizations/edit/:id", meta: { ...iam, parent: "iam_grp", label: "Tổ chức (IAM)", canDelete: true } },
              { name: "roles", list: "/iam/roles", meta: { ...iam, parent: "iam_grp", label: "Vai trò" } },
              { name: "memberships", list: "/iam/memberships", meta: { ...iam, parent: "iam_grp", label: "Phân quyền" } },
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
                <Route index element={<Dashboard />} />
                <Route path="/ai" element={<AiConsole />} />

                <Route path="/ventures">
                  <Route index element={<VentureList />} />
                  <Route path="edit/:id" element={<VentureEdit />} />
                  <Route path="show/:id" element={<VentureShow />} />
                </Route>

                <Route path="/workspace">
                  <Route path="orgs">
                    <Route index element={<WsOrgList />} />
                    <Route path="edit/:id" element={<WsOrgEdit />} />
                  </Route>
                  <Route path="members" element={<WsMemberList />} />
                  <Route path="wallet" element={<TxnList />} />
                  <Route path="usage" element={<UsageList />} />
                </Route>

                <Route path="/iam/organizations">
                  <Route index element={<OrgList />} />
                  <Route path="create" element={<OrgCreate />} />
                  <Route path="edit/:id" element={<OrgEdit />} />
                </Route>
                <Route path="/iam/roles" element={<RoleList />} />
                <Route path="/iam/memberships" element={<MembershipList />} />

                <Route path="*" element={<ErrorComponent />} />
              </Route>

              <Route
                element={
                  <Authenticated key="guest" fallback={<Outlet />}>
                    <NavigateToResource resource="dashboard" />
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
