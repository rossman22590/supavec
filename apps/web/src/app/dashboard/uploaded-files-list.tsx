"use client";

import type { Tables } from "@/types/supabase";
import { File, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface UploadedFilesListProps {
  files: Tables<"files">[] | null;
  apiKey: string;
  searchQuery: string;
}

export function UploadedFilesList({
  files,
  apiKey,
  searchQuery,
}: UploadedFilesListProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredFiles = useMemo(() => {
    if (!files) return [];
    return files.filter((file) =>
      file.file_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [files, searchQuery]);

  const totalFiles = filteredFiles.length;
  const totalPages = Math.ceil(totalFiles / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedFiles = filteredFiles.slice(startIndex, startIndex + itemsPerPage);

  const handleDelete = async (fileId: string, fileName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${fileName}?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/delete_file`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: apiKey,
          },
          body: JSON.stringify({ file_id: fileId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete file: ${response.status}`);
      }

      toast.success("File deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error(
        `Failed to delete file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="mt-6 w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Uploaded Files</h3>
      </div>
      {totalFiles === 0 ? (
        <p className="text-muted-foreground">No files have been uploaded yet.</p>
      ) : (
        <>
          <ul className="space-y-3">
            {displayedFiles.map((file) => (
              <li
                key={file.id}
                className="flex items-center justify-between bg-muted p-3 rounded-md"
              >
                <div className="flex items-center space-x-3 w-full">
                  <File className="h-5 w-5 text-blue-500" />
                  <div className="flex items-center justify-between w-full">
                    <p className="font-medium">{file.file_name}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(file.file_id!, file.file_name!)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-5 w-5 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <Button variant="outline" onClick={handlePrevPage} disabled={currentPage === 1}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}


// "use client";

// import type { Tables } from "@/types/supabase";
// import { File, Trash2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { useState, useMemo } from "react";
// import { toast } from "sonner";
// import { useRouter } from "next/navigation";

// export function UploadedFilesList({
//   files,
//   apiKey,
// }: {
//   files: Tables<"files">[] | null;
//   apiKey: string;
// }) {
//   const router = useRouter();
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   // Filter files based on the search query.
//   const filteredFiles = useMemo(() => {
//     if (!files) return [];
//     return files.filter((file) =>
//       file.file_name?.toLowerCase().includes(searchQuery.toLowerCase())
//     );
//   }, [files, searchQuery]);

//   const totalFiles = filteredFiles.length;
//   const totalPages = Math.ceil(totalFiles / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const displayedFiles = filteredFiles.slice(startIndex, startIndex + itemsPerPage);

//   const handleDelete = async (fileId: string, fileName: string) => {
//     if (!window.confirm(`Are you sure you want to delete ${fileName}?`)) {
//       return;
//     }

//     setIsDeleting(true);
//     try {
//       const response = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/delete_file`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             authorization: apiKey,
//           },
//           body: JSON.stringify({ file_id: fileId }),
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.message || `Failed to delete file: ${response.status}`);
//       }

//       toast.success("File deleted successfully");
//       router.refresh();
//     } catch (error) {
//       toast.error(
//         `Failed to delete file: ${
//           error instanceof Error ? error.message : "Unknown error"
//         }`
//       );
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   const handlePrevPage = () => {
//     if (currentPage > 1) setCurrentPage(currentPage - 1);
//   };

//   const handleNextPage = () => {
//     if (currentPage < totalPages) setCurrentPage(currentPage + 1);
//   };

//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchQuery(e.target.value);
//     setCurrentPage(1);
//   };

//   return (
//     <div className="mt-6 w-full">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-lg font-semibold">Uploaded Files</h3>
//         <input
//           type="text"
//           placeholder="Search files..."
//           value={searchQuery}
//           onChange={handleSearchChange}
//           className="border rounded-md px-2 py-1 text-sm"
//         />
//       </div>
//       {totalFiles === 0 ? (
//         <p className="text-muted-foreground">No files have been uploaded yet.</p>
//       ) : (
//         <>
//           <ul className="space-y-3">
//             {displayedFiles.map((file) => (
//               <li
//                 key={file.id}
//                 className="flex items-center justify-between bg-muted p-3 rounded-md"
//               >
//                 <div className="flex items-center space-x-3 w-full">
//                   <File className="h-5 w-5 text-blue-500" />
//                   <div className="flex items-center justify-between w-full">
//                     <p className="font-medium">{file.file_name}</p>
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       onClick={() => handleDelete(file.file_id!, file.file_name!)}
//                       disabled={isDeleting}
//                     >
//                       <Trash2 className="h-5 w-5 text-muted-foreground" />
//                     </Button>
//                   </div>
//                 </div>
//               </li>
//             ))}
//           </ul>
//           {totalPages > 1 && (
//             <div className="flex items-center justify-between mt-4">
//               <Button variant="outline" onClick={handlePrevPage} disabled={currentPage === 1}>
//                 Previous
//               </Button>
//               <span className="text-sm text-muted-foreground">
//                 Page {currentPage} of {totalPages}
//               </span>
//               <Button
//                 variant="outline"
//                 onClick={handleNextPage}
//                 disabled={currentPage === totalPages}
//               >
//                 Next
//               </Button>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// }


// "use client";

// import type { Tables } from "@/types/supabase";
// import { File, Trash2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { useState } from "react";
// import { toast } from "sonner";
// import { useRouter } from "next/navigation";

// export function UploadedFilesList({
//   files,
//   apiKey,
// }: {
//   files: Tables<"files">[] | null;
//   apiKey: string;
// }) {
//   const router = useRouter();
//   const [isDeleting, setIsDeleting] = useState(false);

//   const handleDelete = async (fileId: string, fileName: string) => {
//     if (!window.confirm(`Are you sure you want to delete ${fileName}?`)) {
//       return;
//     }

//     setIsDeleting(true);
//     try {
//       const response = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/delete_file`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             authorization: apiKey,
//           },
//           body: JSON.stringify({
//             file_id: fileId,
//           }),
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(
//           errorData.message || `Failed to delete file: ${response.status}`
//         );
//       }

//       toast.success("File deleted successfully");
//       router.refresh();
//     } catch (error) {
//       toast.error(
//         `Failed to delete file: ${error instanceof Error ? error.message : "Unknown error"}`
//       );
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   return (
//     <div className="mt-6">
//       <h3 className="text-lg font-semibold mb-4">Uploaded Files</h3>
//       {files?.length === 0 ? (
//         <p className="text-muted-foreground">
//           No files have been uploaded yet.
//         </p>
//       ) : (
//         <ul className="space-y-3">
//           {files?.map((file) => (
//             <li
//               key={file.id}
//               className="flex items-center justify-between bg-muted p-3 rounded-md"
//             >
//               <div className="flex items-center space-x-3 w-full">
//                 <File className="h-5 w-5 text-blue-500" />
//                 <div className="flex items-center justify-between w-full">
//                   <p className="font-medium">{file.file_name}</p>
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     onClick={() => handleDelete(file.file_id!, file.file_name!)}
//                     disabled={isDeleting}
//                   >
//                     <Trash2 className="size-5 text-muted-foreground" />
//                   </Button>
//                 </div>
//               </div>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }
