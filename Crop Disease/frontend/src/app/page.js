"use client";
import { useState } from "react";
import Image from "next/image";
import { Upload } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";

import { Button } from "@/components/ui/button";

export default function Home() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [score, setScore] = useState("");
  const [label, setLabel] = useState("");

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      console.log(imageUrl);
      setSelectedImage(imageUrl);
    }
  };

  const handleUploadButtonClick = () => {
    // Trigger file input when "Upload" button is clicked
    document.getElementById("upload-input").click();
  };

  const handleAnalyzeButtonClick = async () => {
    try {
      if (selectedImage) {
        // Convert the selected image to base64
        const file = await fetch(selectedImage)
          .then((res) => res.blob())
          .then(
            (blob) =>
              new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
              })
          );

        // Send the base64-encoded image to the FastAPI endpoint
        const response = await fetch("http://127.0.0.1:8000/classify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ encoded_image: file.split(",")[1] }),
        });

        if (response.ok) {
          const result = await response.json();
          const firstClassification = result[0];

          // Assuming each classification has a 'score' and 'label' property
          const { score, label } = firstClassification;

          // Set the state variables

          setScore(score);
          setLabel(label);

          console.log(result); // Handle the classification result as needed
        } else {
          console.error(`Error: ${response.status} - ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Green-Insight🌱</CardTitle>
          <CardDescription>
            Guard your greens! 🌿🛡️Detect and protect. #PlantHealth 🌱
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedImage && (
            <div className="mt-4 mb-4">
              <Image
                src={selectedImage}
                alt="Uploaded Image"
                width={300}
                height={200}
              />
            </div>
          )}
          <label htmlFor="upload-input" className="cursor-pointer">
            <input
              type="file"
              id="upload-input"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={handleUploadButtonClick}
            >
              <Upload />
            </Button>
          </label>
        </CardContent>
        <CardFooter className="flex justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="w-full" onClick={handleAnalyzeButtonClick}>
                Analyze
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Output 🔄</AlertDialogTitle>
                <AlertDialogDescription>
                  {label}
                  {/* <Progress value={score * 100} /> */}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction className="w-full">okay</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}
