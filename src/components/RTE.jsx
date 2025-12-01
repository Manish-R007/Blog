import React from 'react'
import {Controller} from "react-hook-form"
import {Editor} from "@tinymce/tinymce-react"

function RTE({
    name, control, label, defaultValue = ""
}) {
  return (
    <div className='w-full'>
        {
            label && <label className='inline-block mb-1 pl-1 text-white'> {label}</label>
        }
        <Controller
        name={name || "content"}
        control={control}
        render={({field: {onChange}}) => (
            <Editor
            apiKey='t4c0uetnf757tzzd1x5sl6og5ruancgcyxyzraygaswj2ia4'
            initialValue={defaultValue}
            init={{
                branding: false,
                height: 500,
                menubar: false, // Simplify by removing menubar
                plugins: [
                    "advlist", "autolink", "lists", "link", "image", 
                    "charmap", "preview", "anchor", "searchreplace", 
                    "visualblocks", "code", "fullscreen", "insertdatetime", 
                    "media", "table", "help", "wordcount"
                ],
                toolbar: "undo redo | blocks | bold italic underline | alignleft aligncenter alignright | bullist numlist outdent indent | link image | removeformat | help",
                content_style: `
                    body { 
                        font-family: Helvetica, Arial, sans-serif; 
                        font-size: 14px;
                        line-height: 1.6;
                        color: #333;
                        background: #fff;
                    }
                `,
            }}
            onEditorChange={onChange}
            />
        )}
        />
    </div>
  )
}

export default RTE