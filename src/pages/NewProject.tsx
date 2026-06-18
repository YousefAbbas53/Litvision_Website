import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { UploadCloud, FileText, CheckCircle, ArrowLeft, Loader2, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { booksApi } from "@/lib/api";
import libraryBg from "@/assets/library-bg.jpg";

const CATEGORIES = [
  { id: "Adventure", name: "Adventure" },
  { id: "Romance", name: "Romance" },
  { id: "Mystery", name: "Mystery" },
  { id: "Sci-Fi", name: "Sci-Fi" },
  { id: "Fantasy", name: "Fantasy" },
  { id: "Self-Help", name: "Self-Help" }
];

const NewProject = () => {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  
  // File states
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("Adventure");
  const [description, setDescription] = useState("");
  const [pages, setPages] = useState("300");
  const [language, setLanguage] = useState("English");
  const [isbn, setIsbn] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (uploadedFile: File) => {
    const isPdf = uploadedFile.type === "application/pdf" || uploadedFile.name.endsWith(".pdf");
    if (!isPdf) {
      toast.error("Only PDF files are supported.");
      return;
    }
    
    if (uploadedFile.size > 50 * 1024 * 1024) {
      toast.error("File size exceeds 50MB limit.");
      return;
    }

    setPdfFile(uploadedFile);
    // Pre-fill Title from file name as helper
    const baseName = uploadedFile.name.replace(/\.[^/.]+$/, "");
    setTitle(baseName.substring(0, 50));
    toast.success("PDF file loaded successfully!");
  };

  const handleCoverInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are supported for covers.");
        return;
      }
      setCoverImage(file);
      if (coverPreviewUrl) {
        URL.revokeObjectURL(coverPreviewUrl);
      }
      setCoverPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile) {
      toast.error("Please select a PDF file first.");
      return;
    }
    if (!title.trim() || !author.trim() || !description.trim()) {
      toast.error("Please fill in all required fields (Title, Author, Description).");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("Title", title.trim());
    formData.append("Author", author.trim());
    formData.append("Description", description.trim());
    formData.append("Category", category);
    formData.append("Pages", pages);
    formData.append("Language", language.trim() || "English");
    formData.append("Isbn", isbn.trim());
    formData.append("PdfFile", pdfFile);
    if (coverImage) {
      formData.append("CoverImage", coverImage);
    }

    try {
      const uploadedBook = await booksApi.uploadBook(formData);
      
      // Auto-save the uploaded book to the user's library
      if (uploadedBook?.id) {
        try {
          await booksApi.saveBook(uploadedBook.id);
        } catch (saveErr) {
          // Non-critical — upload succeeded, just couldn't auto-save
          console.warn("Auto-save to library failed:", saveErr);
        }
      }

      setIsSuccess(true);
      toast.success("Book uploaded and added to your Library!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload book to server.");
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-start p-4 md:p-6 bg-background relative overflow-hidden">
        
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={libraryBg}
            alt="Library Background"
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-background/95 backdrop-blur-sm" />
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="self-start flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors z-10 interactive"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Library</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 relative z-10"
        >
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-2">
            Upload New Book
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Import your PDF story and generate companion AI features instantly
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-2xl bg-card/40 border border-border/80 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-xl mb-12"
        >
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center py-8"
              >
                <CheckCircle className="w-20 h-20 text-green-500 mb-6 drop-shadow-[0_0_20px_rgba(34,197,94,0.3)]" />
                <h3 className="text-2xl font-serif font-bold text-foreground mb-3">
                  Upload Successful!
                </h3>
                <p className="text-muted-foreground text-base max-w-sm mb-8">
                  "{title}" has been added to the LITVISION library.
                </p>
                <div className="flex gap-4">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setIsSuccess(false);
                      setPdfFile(null);
                      setCoverImage(null);
                      setCoverPreviewUrl(null);
                      setTitle("");
                      setAuthor("");
                      setDescription("");
                    }}
                    className="interactive"
                  >
                    Upload Another
                  </Button>
                  <Button 
                    variant="accent"
                    onClick={() => navigate("/library")}
                    className="interactive"
                  >
                    Go to My Library
                  </Button>
                </div>
              </motion.div>
            ) : !pdfFile ? (
              // STEP 1: Select PDF file
              <motion.div
                key="dropzone"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => document.getElementById("pdf-upload")?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 md:p-16 flex flex-col items-center justify-center text-center cursor-pointer interactive transition-colors ${
                  isDragging
                    ? "border-amber-500 bg-primary/10"
                    : "border-border hover:border-amber-500/50 hover:bg-muted/30"
                }`}
              >
                <input
                  type="file"
                  id="pdf-upload"
                  className="hidden"
                  accept=".pdf"
                  onChange={onFileInput}
                />
                
                <UploadCloud className="w-16 h-16 text-muted-foreground mb-4 group-hover:text-amber-500 transition-colors" />
                
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Drag and drop your book PDF
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  or click to select a file from your computer
                </p>
                
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span className="bg-background px-3 py-1 rounded-full border border-border">PDF Format</span>
                  <span className="bg-background px-3 py-1 rounded-full border border-border">Max size: 50MB</span>
                </div>
              </motion.div>
            ) : (
              // STEP 2: Fill Metadata Form
              <motion.form
                key="metadata-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* PDF info badge */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-amber-500/20 text-sm">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="font-semibold text-foreground truncate">{pdfFile.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPdfFile(null);
                      setCoverImage(null);
                      setCoverPreviewUrl(null);
                    }}
                    className="text-xs text-destructive hover:underline ml-2 shrink-0 interactive"
                  >
                    Remove File
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left Column: Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                        Book Title *
                      </label>
                      <Input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. The Lord of the Rings"
                        maxLength={100}
                        className="bg-background/50"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                        Author Name *
                      </label>
                      <Input
                        type="text"
                        required
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="e.g. J.R.R. Tolkien"
                        maxLength={80}
                        className="bg-background/50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                          Category *
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full bg-background/50 border border-border hover:border-amber-500/30 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat.id} value={cat.id} className="bg-card">
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                          Pages
                        </label>
                        <Input
                          type="number"
                          value={pages}
                          onChange={(e) => setPages(e.target.value)}
                          placeholder="300"
                          min="1"
                          className="bg-background/50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                          Language
                        </label>
                        <Input
                          type="text"
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          placeholder="English"
                          className="bg-background/50"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                          ISBN
                        </label>
                        <Input
                          type="text"
                          value={isbn}
                          onChange={(e) => setIsbn(e.target.value)}
                          placeholder="Optional"
                          className="bg-background/50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Description & Cover Image */}
                  <div className="space-y-4 flex flex-col justify-between">
                    <div className="flex-1 flex flex-col">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                        Description *
                      </label>
                      <textarea
                        required
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Write a brief description or synopsis of the book..."
                        className="w-full flex-1 min-h-[120px] bg-background/50 border border-border focus:ring-1 focus:ring-amber-500 rounded-lg p-3 text-sm resize-none focus:outline-none"
                      />
                    </div>

                    {/* Cover image picker */}
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                        Cover Image (Optional)
                      </label>
                      <div className="flex items-center gap-4">
                        <div 
                          onClick={() => document.getElementById("cover-upload")?.click()}
                          className="w-20 h-28 border border-dashed border-border rounded-lg bg-background/50 hover:bg-muted/40 hover:border-amber-500/50 flex flex-col items-center justify-center cursor-pointer interactive overflow-hidden text-center shrink-0"
                        >
                          {coverPreviewUrl ? (
                            <img src={coverPreviewUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                          ) : (
                            <Image className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <input
                            type="file"
                            id="cover-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={handleCoverInput}
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => document.getElementById("cover-upload")?.click()}
                            className="interactive"
                          >
                            Select Image
                          </Button>
                          <p className="text-muted-foreground text-[10px] mt-1.5">
                            JPEG, PNG or WEBP. Max size: 2MB.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setPdfFile(null);
                      setCoverImage(null);
                      setCoverPreviewUrl(null);
                    }}
                    disabled={isUploading}
                    className="interactive"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="accent"
                    disabled={isUploading}
                    className="min-w-[140px] gap-2 interactive"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-accent-foreground" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Project</span>
                        <UploadCloud className="w-4 h-4 text-accent-foreground" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </Layout>
  );
};

export default NewProject;
