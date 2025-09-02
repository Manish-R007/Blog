import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Button from "../Button";
import Input from "../Input";
import RTE from "../RTE";
import Select from "../Select";
import appwriteService from "../../appwrite/config";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function PostForm({ post }) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    getValues,
  } = useForm({
    defaultValues: {
      title: post?.title || "",
      slug: post?.slug || "",
      content: post?.content || "",
      status: post?.status || "active",
    },
  });

  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);

  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  async function fetchImagePreview(fileId) {
  if (!fileId) {
    setImagePreviewUrl("");
    console.log("No fileId provided for preview");
    return;
  }
  try {
    const url = await appwriteService.getFilePreview(fileId);
    console.log("Image preview URL:", url);
    setImagePreviewUrl(url);
  } catch (error) {
    console.error("Error fetching image preview URL:", {
      message: error.message,
      code: error.code,
      id: error.response?.id,
    });
    setImagePreviewUrl("");
  }
}

  useEffect(() => {
    if (post?.featuredImage) {
      fetchImagePreview(post.featuredImage);
    }
  }, [post?.featuredImage]);

  const submit = async (data) => {
    try {
      let file = null;
      if (data.image?.[0]) {
        console.log("File to upload:", data.image[0]);
        file = await appwriteService.uploadFile(data.image[0]);
        if (!file) {
          console.error("File upload failed. Check console or Network tab for details.");
          return;
        }
        console.log("File uploaded successfully:", file.$id);
      }

      if (post) {
        if (file && post.featuredImage) {
          await appwriteService.deleteFile(post.featuredImage);
        }
        const dbPost = await appwriteService.updatePost(post.$id, {
          ...data,
          featuredImage: file ? file.$id : post.featuredImage,
        });
        if (dbPost) {
          navigate(`/post/${dbPost.$id}`);
        } else {
          console.error("Update post failed");
          alert("Failed to update post. Check console for details.");
        }
      } else {
        if (file) {
          const fileId = file.$id;
          const dbPost = await appwriteService.createPost({
            ...data,
            featuredImage: fileId,
            userId: userData.$id,
          });
          if (dbPost) {
            navigate(`/post/${dbPost.$id}`);
          } else {
            console.error("Create post failed");
            alert("Failed to create post. Check console for details.");
          }
        } else {
          console.error("No file uploaded and required for new post");
        }
      }
    } catch (error) {
      console.error("Submit error:", {
        message: error.message,
        code: error.code,
        response: error.response,
      });
    }
  };

  const slugTransform = useCallback((value) => {
    if (value && typeof value === "string")
      return value
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z\d\s]+/g, "-")
        .replace(/\s/g, "-");
    return "";
  }, []);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "title") {
        setValue("slug", slugTransform(value.title), { shouldValidate: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, slugTransform, setValue]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        console.error("Invalid file type. Use .jpg, .jpeg, or .png:", file.type);
        return;
      }
      console.log("Selected file:", {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
      });
    } else {
      console.log("No file selected");
    }
  };

  return (
    <form
      onSubmit={handleSubmit((data) => {
        console.log("Form data:", data);
        submit(data);
      })}
      className="flex flex-wrap"
    >
      <div className="w-2/3 px-2">
        <Input
          label="Title"
          placeholder="Title"
          className="mb-4 text-black"
          {...register("title", { required: true })}
        />
        <Input
          label="Slug :"
          placeholder="Slug"
          className="mb-4 text-white"
          {...register("slug", { required: true })}
          onInput={(e) => {
            setValue("slug", slugTransform(e.currentTarget.value), {
              shouldValidate: true,
            });
          }}
        />
        <RTE
          label="Content: "
          name="content"
          control={control}
          defaultValue={getValues("content")}
        />
      </div>
      <div className="w-1/3 px-2">
        <Input
          label="Featured Image"
          type="file"
          className="mb-4 text-black"
          accept="image/png, image/jpg, image/jpeg"
          {...register("image", { required: !post })}
          onChange={handleImageChange}
        />
        {post && imagePreviewUrl && (
          <div className="w-full mb-4">
            <img
              src={imagePreviewUrl}
              alt={post.title}
              className="rounded-lg"
              style={{ maxWidth: "100%" }}
            />
          </div>
        )}
        <Select
          options={["active", "inactive"]}
          label="Status"
          className="mb-4"
          {...register("status", { required: true })}
        />
        <Button
          type="submit"
          bgColor={post ? "bg-green-500" : undefined}
          className="w-full"
        >
          {post ? "Update" : "Submit"}
        </Button>
      </div>
    </form>
  );
}