"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { createClient } from "@/utils/supabase/server";
import { GenerateForm } from "./generate-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadedFilesList } from "./uploaded-files-list";
import { EmbeddingsQuery } from "./embeddings-query";
import { ContentSubmission } from "./content-submission";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { UploadFormWrapper } from "./upload-form-wrappper";
import { useState } from "react";
import type { Tables } from "@/types/supabase";

export const metadata: Metadata = {
  robots: "noindex, nofollow",
};

// Update the Profile and TeamMembership types to match Supabase data structure
type Profile = {
  id: string;
  name: string | null;
  email: string | null;
  onboarding_at: string | null;
};

type TeamMembership = {
  id: string;
  teams: {
    name: string | null;
    id: string;
  };
};

interface DashboardContentProps {
  profile: Profile;
  teamMemberships: TeamMembership[] | null;
  uploadedFiles: Tables<"files">[] | null;
  activeApiKey: string | null;
}


function DashboardContent({ 
  profile, 
  teamMemberships, 
  uploadedFiles, 
  activeApiKey 
}: DashboardContentProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <SidebarProvider>
      <AppSidebar user={profile} team={teamMemberships} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="rounded-xl p-4 bg-muted/50">
            <h2 className="text-2xl font-bold mb-4">
              Welcome to AI Tutor RAG API
            </h2>
            <p>
              {!activeApiKey
                ? "Generate your API key to get started with Supavec."
                : "Use your API key to interact with the AI Tutor RAG API."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border bg-muted/50">
              <h3 className="text-xl font-semibold mb-4">API Key Management</h3>
              {!activeApiKey ? (
                <GenerateForm />
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Your API key:</p>
                  <code className="px-2 py-1 bg-muted rounded-md text-sm block w-full overflow-x-auto">
                    {activeApiKey}
                  </code>
                </div>
              )}
            </div>

            {activeApiKey && (
              <div className="p-4 rounded-xl border bg-muted/50">
                <h3 className="text-xl font-semibold mb-4">Embeddings Query</h3>
                <EmbeddingsQuery
                  uploadedFiles={uploadedFiles ?? []}
                  apiKey={activeApiKey}
                />
              </div>
            )}
          </div>

          {activeApiKey && (
            <div className="mt-4">
              <div className="rounded-xl bg-muted/50 p-4 border">
                <Tabs defaultValue="upload" className="space-y-4">
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="upload">Upload Files</TabsTrigger>
                    <TabsTrigger value="content">Submit Content</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upload" className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold mb-4">
                        File Upload
                      </h4>
                      <p className="mb-4">
                        Upload PDF files to generate embeddings.
                      </p>
                      <UploadFormWrapper apiKey={activeApiKey} />
                      <div className="mt-6">
                        <input 
                          type="search"
                          placeholder="Search files..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full p-3 rounded-lg border mb-4 text-lg bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <UploadedFilesList
                          files={uploadedFiles ?? []}
                          apiKey={activeApiKey}
                          searchQuery={searchQuery}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="content">
                    <ContentSubmission apiKey={activeApiKey} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, email, onboarding_at")
    .single();

  if (!profile?.onboarding_at) {
    redirect("/onboarding");
  }

  const { data: apiKeys } = await supabase
    .from("api_keys")
    .select("*")
    .order('created_at', { ascending: false });

  const { data: teamMemberships } = await supabase
    .from("team_memberships")
    .select("id, teams(name, id)");

  const { data: uploadedFiles } = apiKeys?.[0]?.team_id 
    ? await supabase
        .from("files")
        .select("*")
        .match({ team_id: apiKeys[0].team_id })
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
    : { data: [] };

  const activeApiKey = apiKeys && apiKeys.length > 0 ? apiKeys[0].api_key : null;

  return (
    <DashboardContent
      profile={profile}
      teamMemberships={teamMemberships}
      uploadedFiles={uploadedFiles}
      activeApiKey={activeApiKey}
    />
  );
}



// import { AppSidebar } from "@/components/app-sidebar";
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbList,
//   BreadcrumbPage,
// } from "@/components/ui/breadcrumb";
// import { Separator } from "@/components/ui/separator";
// import {
//   SidebarInset,
//   SidebarProvider,
//   SidebarTrigger,
// } from "@/components/ui/sidebar";
// import { createClient } from "@/utils/supabase/server";
// import { GenerateForm } from "./generate-form";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { UploadedFilesList } from "./uploaded-files-list";
// import { EmbeddingsQuery } from "./embeddings-query";
// import { ContentSubmission } from "./content-submission";
// import { redirect } from "next/navigation";
// import type { Metadata } from "next";
// import { UploadFormWrapper } from "./upload-form-wrappper";

// export const metadata: Metadata = {
//   robots: "noindex, nofollow",
// };

// export default async function Page() {
//   const supabase = await createClient();
//   const { data } = await supabase
//     .from("profiles")
//     .select("id, name, email, onboarding_at")
//     .single();

//   if (!data?.onboarding_at) {
//     redirect("/onboarding");
//   }

//   const { data: apiKeys } = await supabase.from("api_keys").select("*");
//   const { data: uploadedFiles } = await supabase
//     .from("files")
//     .select("*")
//     .match({ team_id: apiKeys?.[0]?.team_id })
//     .is("deleted_at", null)
//     .order("created_at", { ascending: false });
//   const { data: teamMemberships } = await supabase
//     .from("team_memberships")
//     .select("id, teams(name, id)");

//   return (
//     <SidebarProvider>
//       <AppSidebar user={data} team={teamMemberships} />
//       <SidebarInset>
//         <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
//           <div className="flex items-center gap-2 px-4">
//             <SidebarTrigger className="-ml-1" />
//             <Separator orientation="vertical" className="mr-2 h-4" />
//             <Breadcrumb>
//               <BreadcrumbList>
//                 <BreadcrumbItem>
//                   <BreadcrumbPage>Dashboard</BreadcrumbPage>
//                 </BreadcrumbItem>
//               </BreadcrumbList>
//             </Breadcrumb>
//           </div>
//         </header>
//         <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
//           <div className="rounded-xl p-4">
//             <h2 className="text-2xl font-bold mb-4">Welcome to AI Tutor RAG API</h2>
//             <p>Generate your API key to get started with AI Tutro RAG.</p>
//           </div>
//           <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min p-4">
//             <div className="flex">
//               <div className="p-4 rounded-xl border basis-full md:basis-1/2 bg-muted/50">
//                 <h3 className="text-xl font-semibold mb-4">
//                   API Key Generation
//                 </h3>
//                 <p>Your API key will appear here once generated.</p>
//                 {Array.isArray(apiKeys) && apiKeys?.length > 0 ? (
//                   <span className="p-1 text-sm bg-muted-foreground/20 rounded-md">
//                     {apiKeys[0].api_key}
//                   </span>
//                 ) : (
//                   <GenerateForm />
//                 )}
//               </div>
//             </div>
//             {Array.isArray(apiKeys) && apiKeys?.length > 0 && (
//               <>
//                 <h3 className="text-xl font-semibold mb-4 mt-8">Playground</h3>
//                 <div className="flex gap-4 flex-col md:flex-row">
//                   <div className="min-h-[50vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-4 border">
//                     <Tabs defaultValue="upload" className="space-y-4">
//                       <TabsList>
//                         <TabsTrigger value="upload">Upload files</TabsTrigger>
//                         <TabsTrigger value="content">
//                           Submit Content
//                         </TabsTrigger>
//                       </TabsList>
//                       <TabsContent value="upload" className="space-y-4">
//                         <div className="mt-6">
//                           <h4 className="text-lg font-semibold mb-4">
//                             File Upload
//                           </h4>
//                           <p className="mb-4">
//                             Upload PDF files to generate embeddings.
//                           </p>
//                           <UploadFormWrapper apiKey={apiKeys[0].api_key!} />
//                           <UploadedFilesList
//                             files={uploadedFiles}
//                             apiKey={apiKeys[0].api_key!}
//                           />
//                         </div>
//                       </TabsContent>
//                       <TabsContent value="content">
//                         <ContentSubmission apiKey={apiKeys[0].api_key!} />
//                       </TabsContent>
//                     </Tabs>
//                   </div>
//                   <div className="min-h-[50vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-4 border">
//                     <EmbeddingsQuery
//                       uploadedFiles={uploadedFiles}
//                       apiKey={apiKeys[0].api_key!}
//                     />
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </SidebarInset>
//     </SidebarProvider>
//   );
// }
