// import { useState, useEffect } from "react";
// import type { ClassroomWithUsers } from "../../types";
// import axios from "axios";
// import { useAuth } from "../../auth-context";

// export type TestForm = {
//   name: string;
//   description?: string;
//   is_timed: boolean;
//   duration_minutes?: number;
//   max_attempts: number;
//   available_from?: string;
//   available_until?: string;
//   graded_by: "auto" | "manual";
// };

// type Props = {
//   mode: "create" | "edit";
//   initialData?: Partial<TestForm>;
//   onSubmit: (data: TestForm) => Promise<void>;
//   onCancel?: () => void;
//   showClassroomSelector?: boolean;
// };

// export function AssignmentForm({
//   mode,
//   initialData = {},
//   onSubmit,
//   onCancel,
//   showClassroomSelector = false,
// }: Props) {
//   const { user } = useAuth();
//   const [form, setForm] = useState<TestForm>({
//     name: initialData.name || "",
//     description: initialData.description || "",
//     is_timed: initialData.is_timed || false,
//     duration_minutes: initialData.duration_minutes || 30,
//     max_attempts: initialData.max_attempts || 1,
//     available_from: initialData.available_from || "",
//     available_until: initialData.available_until || "",
//     graded_by: initialData.graded_by || "auto",
//   });

//   const [status, setStatus] = useState<
//     "idle" | "submitting" | "success" | "error"
//   >("idle");
//   const [classrooms, setClassrooms] = useState<ClassroomWithUsers[]>([]);
//   const [assignedClassroomIds, setAssignedClassroomIds] = useState<Set<number>>(
//     new Set()
//   );
//   const [search, setSearch] = useState("");

//   useEffect(() => {
//     if (!showClassroomSelector) return;
//     async function fetchClassrooms() {
//       try {
//         const res = await axios.get("/api/classrooms", {
//           headers: { "x-user-id": user?.id, "x-user-role": user?.role },
//         });
//         setClassrooms(res.data);
//       } catch {
//         console.error("Failed to fetch classrooms");
//       }
//     }
//     fetchClassrooms();
//   }, [showClassroomSelector, user]);

//   const toggleClassroom = (id: number) => {
//     setAssignedClassroomIds((prev) => {
//       const next = new Set(prev);
//       if (next.has(id)) {
//         next.delete(id);
//       } else {
//         next.add(id);
//       }
//       return next;
//     });
//   };

//   const updateForm = <K extends keyof TestForm>(
//     field: K,
//     value: TestForm[K]
//   ) => {
//     setForm((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setStatus("submitting");
//     try {
//       await onSubmit(form);
//       setStatus("success");
//     } catch {
//       setStatus("error");
//     }
//   };

//   const filtered = classrooms
//     .filter((c) =>
//       c.classroom.name.toLowerCase().includes(search.toLowerCase())
//     )
//     .sort((a, b) => {
//       const aAssigned = assignedClassroomIds.has(a.classroom.id);
//       const bAssigned = assignedClassroomIds.has(b.classroom.id);
//       return aAssigned === bAssigned ? 0 : aAssigned ? -1 : 1;
//     });

//   return (
//     <form onSubmit={handleSubmit} className="space-y-5">
//       <div>
//         <label className="block font-medium">Test Name:</label>
//         <input
//           value={form.name}
//           onChange={(e) => updateForm("name", e.target.value)}
//           required
//           className="w-full border px-3 py-2 rounded"
//         />
//       </div>

//       <div>
//         <label className="block font-medium">Description:</label>
//         <textarea
//           value={form.description}
//           onChange={(e) => updateForm("description", e.target.value)}
//           className="w-full border px-3 py-2 rounded"
//         />
//       </div>

//       <div className="grid grid-cols-2 gap-4 items-center">
//         <label className="flex items-center space-x-2">
//           <input
//             type="checkbox"
//             checked={form.is_timed}
//             onChange={(e) => updateForm("is_timed", e.target.checked)}
//           />
//           <span>Timed</span>
//         </label>
//         <div>
//           <label className="block font-medium">Duration (minutes):</label>
//           <input
//             type="number"
//             disabled={!form.is_timed}
//             value={form.duration_minutes || ""}
//             onChange={(e) =>
//               updateForm(
//                 "duration_minutes",
//                 Math.max(1, Number(e.target.value))
//               )
//             }
//             className="w-full border px-3 py-2 rounded"
//             min={1}
//           />
//         </div>
//       </div>

//       <div>
//         <label className="block font-medium">Max Attempts:</label>
//         <input
//           type="number"
//           min={1}
//           value={form.max_attempts}
//           onChange={(e) =>
//             updateForm("max_attempts", Math.max(1, Number(e.target.value)))
//           }
//           className="w-full px-3 py-2 rounded border"
//         />
//       </div>

//       <div>
//         <label className="block font-medium">Available From:</label>
//         <input
//           type="datetime-local"
//           value={form.available_from || ""}
//           onChange={(e) => updateForm("available_from", e.target.value)}
//           className="w-full border px-3 py-2 rounded"
//         />
//       </div>

//       <div>
//         <label className="block font-medium">Available Until:</label>
//         <input
//           type="datetime-local"
//           value={form.available_until || ""}
//           onChange={(e) => updateForm("available_until", e.target.value)}
//           className="w-full border px-3 py-2 rounded"
//         />
//       </div>

//       <div>
//         <label className="block font-medium">Graded By:</label>
//         <select
//           value={form.graded_by}
//           onChange={(e) =>
//             updateForm("graded_by", e.target.value as "auto" | "manual")
//           }
//           className="w-full px-3 py-2 rounded border"
//         >
//           <option value="auto">Auto</option>
//           <option value="manual">Manual</option>
//         </select>
//       </div>

//       {showClassroomSelector && (
//         <div>
//           <label className="block font-medium mb-2">
//             Assign to Classrooms:
//           </label>
//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search classrooms..."
//             className="w-full px-3 py-2 mb-3 border rounded"
//           />
//           <ul className="divide-y border rounded">
//             {filtered.map((cls) => {
//               const id = cls.classroom.id;
//               const isAssigned = assignedClassroomIds.has(id);

//               return (
//                 <li
//                   key={id}
//                   className="py-3 px-2 flex justify-between items-center"
//                 >
//                   <span className="text-lg">
//                     {cls.classroom.name}
//                     {isAssigned && (
//                       <span className="text-green-600 ml-2">(Selected)</span>
//                     )}
//                   </span>
//                   <button
//                     type="button"
//                     onClick={() => toggleClassroom(id)}
//                     className={`px-4 py-1.5 text-sm text-white rounded ${
//                       isAssigned
//                         ? "bg-red-600 hover:bg-red-700"
//                         : "bg-indigo-600 hover:bg-indigo-700"
//                     }`}
//                   >
//                     {isAssigned ? "Unselect" : "Select"}
//                   </button>
//                 </li>
//               );
//             })}
//           </ul>
//         </div>
//       )}

//       <div className="flex justify-end gap-x-2 pt-2">
//         {onCancel && (
//           <button
//             type="button"
//             onClick={onCancel}
//             className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
//           >
//             Cancel
//           </button>
//         )}
//         <button
//           type="submit"
//           className="bg-blue-600 text-white px-6 py-2 rounded"
//           disabled={status === "submitting"}
//         >
//           {status === "submitting"
//             ? mode === "create"
//               ? "Creating..."
//               : "Saving..."
//             : mode === "create"
//             ? "Create Assignment"
//             : "Save Changes"}
//         </button>
//       </div>

//       {status === "success" && <p className="text-green-600">✅ Success!</p>}
//       {status === "error" && <p className="text-red-600">❌ Failed to save.</p>}
//     </form>
//   );
// }
